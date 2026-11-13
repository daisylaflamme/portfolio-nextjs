-- Materialized views matching the DataSource methods (src/lib/dashboards/online-retail/source.ts).
-- Same definitions as the snapshot (see src/lib/dashboards/online-retail/README.md):
--   revenue = sales lines only; returns_value = |quantity x price| of returns;
--   orders = distinct sales invoices (they add up across months and countries, not across
--   categories or products, because an invoice has one month and one country).
-- Each view has a unique index, so later reloads can use `refresh materialized view concurrently`.

-- kpis, monthlyRevenue, countries, returns (no category filter)
create materialized view if not exists online_retail.mv_month_country as
select
  month,
  country,
  coalesce(sum(revenue)  filter (where not is_return), 0) as revenue,
  coalesce(sum(quantity) filter (where not is_return), 0)::bigint as units,
  count(distinct invoice) filter (where not is_return) as orders,
  coalesce(-sum(revenue) filter (where is_return), 0) as returns_value,
  count(*) filter (where is_return) as return_lines
from online_retail.sales
group by month, country;
create unique index if not exists mv_month_country_key on online_retail.mv_month_country (month, country);

-- The same with a category filter; orders = invoices containing that category.
create materialized view if not exists online_retail.mv_month_country_category as
select
  month,
  country,
  category,
  coalesce(sum(revenue)  filter (where not is_return), 0) as revenue,
  coalesce(sum(quantity) filter (where not is_return), 0)::bigint as units,
  count(distinct invoice) filter (where not is_return) as orders,
  coalesce(-sum(revenue) filter (where is_return), 0) as returns_value,
  count(*) filter (where is_return) as return_lines
from online_retail.sales
group by month, country, category;
create unique index if not exists mv_month_country_category_key
  on online_retail.mv_month_country_category (month, country, category);

-- topProducts and the Pareto curve for any country and month range, product search and
-- per-product monthly sales. orders = invoices containing the product.
create materialized view if not exists online_retail.mv_product_month_country as
select
  stock_code,
  month,
  country,
  category,
  coalesce(sum(quantity) filter (where not is_return), 0)::bigint as units,
  coalesce(sum(revenue)  filter (where not is_return), 0) as revenue,
  count(distinct invoice) filter (where not is_return) as orders,
  coalesce(-sum(revenue) filter (where is_return), 0) as returns_value
from online_retail.sales
group by stock_code, month, country, category;
create unique index if not exists mv_product_month_country_key
  on online_retail.mv_product_month_country (stock_code, month, country);
create index if not exists mv_product_month_country_month_idx
  on online_retail.mv_product_month_country (month, country);

-- cohorts: which customers (with an ID) bought in which month, country and category.
-- Cohort queries filter this by country and category, then take each customer's first month.
create materialized view if not exists online_retail.mv_customer_activity as
select distinct customer_id, month, country, category
from online_retail.sales
where customer_id is not null and not is_return;
create unique index if not exists mv_customer_activity_key
  on online_retail.mv_customer_activity (customer_id, month, country, category);
create index if not exists mv_customer_activity_month_idx on online_retail.mv_customer_activity (month);

-- segments: RFM scores over the whole period, same rules as scripts/build_online_retail_data.py.
-- Reference date = the day after the last invoice. R, F and M are quintiles (ntile) of
-- recency (fewer days is better), orders and revenue; ties are broken by customer_id, so a
-- few customers on a quintile boundary can land one score off from the Python build.
create materialized view if not exists online_retail.mv_rfm as
with inv as (
  select invoice, min(customer_id) as customer_id, min(invoice_date) as at, min(country) as country,
         sum(revenue) as revenue
  from online_retail.sales
  where customer_id is not null and not is_return
  group by invoice
),
ref as (
  select date_trunc('day', max(invoice_date)) + interval '1 day' as at from online_retail.sales
),
c as (
  select customer_id,
         max(at) as last_order,
         count(*) as orders,
         sum(revenue) as revenue,
         (array_agg(country order by at, invoice))[1] as home_country
  from inv
  group by customer_id
),
scored as (
  select c.*,
         floor(extract(epoch from (ref.at - c.last_order)) / 86400)::int as recency_days,
         ntile(5) over (order by ref.at - c.last_order desc, c.customer_id) as r,
         ntile(5) over (order by c.orders, c.customer_id) as f,
         ntile(5) over (order by c.revenue, c.customer_id) as m
  from c cross join ref
)
select customer_id, home_country, recency_days, orders, revenue, r, f, m,
       floor((f + m) / 2.0 + 0.5)::int as fm,
       case
         when r >= 4 and floor((f + m) / 2.0 + 0.5) >= 4 then 'Champions'
         when r >= 3 and floor((f + m) / 2.0 + 0.5) >= 3 then 'Loyal'
         when r >= 3 then 'Promising'
         when floor((f + m) / 2.0 + 0.5) >= 3 then 'At risk'
         else 'Lost'
       end as segment
from scored;
create unique index if not exists mv_rfm_key on online_retail.mv_rfm (customer_id);
create index if not exists mv_rfm_home_country_idx on online_retail.mv_rfm (home_country);
