-- Loads the Phase 1 CSVs into online_retail and refreshes the materialized views.
-- Run from the repo root with psql, as the database owner, over a direct (session) connection:
--   psql "$ONLINE_RETAIL_ADMIN_URL" -f db/online-retail/load.sql
-- Inputs (git-ignored, written by scripts/build_online_retail_data.py):
--   data-raw/out/lines_clean.csv  invoice,code,qty,date,price,customer,country,month,is_return,revenue,category
--   data-raw/out/products.csv     code,description,category
-- Safe to rerun: it replaces the tables' contents.

\set ON_ERROR_STOP on
\timing on

begin;

truncate online_retail.sales, online_retail.products restart identity;

create temp table stage_lines (
  invoice text, code text, qty text, date text, price text, customer text,
  country text, month text, is_return text, revenue text, category text
) on commit drop;
\copy stage_lines from 'data-raw/out/lines_clean.csv' with (format csv, header true)

insert into online_retail.sales
  (invoice, stock_code, quantity, price, invoice_date, month, customer_id, country, category, is_return)
select invoice,
       code,
       qty::integer,
       price::numeric,
       date::timestamp,
       (month || '-01')::date,
       nullif(customer, '')::numeric::integer,   -- "13085.0" -> 13085
       country,
       category,
       is_return::boolean                        -- "True" / "False"
from stage_lines;

create temp table stage_products (code text, description text, category text) on commit drop;
\copy stage_products from 'data-raw/out/products.csv' with (format csv, header true)

insert into online_retail.products (stock_code, description, category)
select code, nullif(description, ''), category from stage_products;

commit;

analyze online_retail.sales;
analyze online_retail.products;

refresh materialized view online_retail.mv_month_country;
refresh materialized view online_retail.mv_month_country_category;
refresh materialized view online_retail.mv_product_month_country;
refresh materialized view online_retail.mv_customer_activity;
refresh materialized view online_retail.mv_rfm;

-- Quick check against the snapshot (compare with meta.revenue, meta.orders, meta.returnsValue
-- in src/data/online-retail/snapshot.json):
select round(sum(revenue), 2)  as revenue,
       sum(orders)              as orders,
       round(sum(returns_value), 2) as returns_value
from online_retail.mv_month_country;
