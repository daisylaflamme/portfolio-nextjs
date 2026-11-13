/**
 * SQL for the Postgres data source, as pure builders: each returns the query text with
 * $1…$n placeholders and the values that fill them. No value is ever written into the text,
 * so a filter can't change the query, and the builders can be unit-tested without a database.
 * The tables and views are in db/online-retail/ (schema `online_retail`).
 *
 * Aggregates are cast to float8 so node-postgres returns numbers instead of strings.
 */
import type { Filters } from "./types.ts";

export interface Query {
  text: string;
  values: (string | number)[];
}

/** Collects values and hands out their placeholders in order. */
class Params {
  readonly values: (string | number)[] = [];
  add(value: string | number): string {
    this.values.push(value);
    return `$${this.values.length}`;
  }
}

const ALL = "all";
const S = "online_retail";

/** "2010-03" → "2010-03-01" (the views store months as dates). */
export const monthDate = (month: string) => `${month}-01`;

/** Escapes LIKE wildcards so a search for "50%" or "a_b" matches those characters literally. */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** The month-range condition on `month`, between From and To (inclusive). */
function monthRange(p: Params, from: string, to: string, column = "month"): string {
  return `${column} between ${p.add(monthDate(from))}::date and ${p.add(monthDate(to))}::date`;
}

/** Country and category conditions, only for filters that aren't "all". */
function scopeConditions(p: Params, f: Pick<Filters, "country" | "category">, opts: { category?: boolean } = {}): string[] {
  const out: string[] = [];
  if (f.country !== ALL) out.push(`country = ${p.add(f.country)}`);
  if (opts.category !== false && f.category !== ALL) out.push(`category = ${p.add(f.category)}`);
  return out;
}

/** mv_month_country, or the category view when a category is selected. */
const monthTable = (f: Filters) => (f.category === ALL ? `${S}.mv_month_country` : `${S}.mv_month_country_category`);

const where = (conditions: string[]) => (conditions.length ? `where ${conditions.join(" and ")}` : "");

/** Current and (if there is one) previous period totals in one pass. */
export function kpisQuery(f: Filters, previous: { from: string; to: string } | null): Query {
  const p = new Params();
  const cur = monthRange(p, f.from, f.to);
  const prev = previous ? monthRange(p, previous.from, previous.to) : null;
  const cols = (cond: string, prefix: string) =>
    [
      `coalesce(sum(revenue) filter (where ${cond}), 0)::float8 as ${prefix}revenue`,
      `coalesce(sum(units) filter (where ${cond}), 0)::float8 as ${prefix}units`,
      `coalesce(sum(orders) filter (where ${cond}), 0)::float8 as ${prefix}orders`,
      `coalesce(sum(returns_value) filter (where ${cond}), 0)::float8 as ${prefix}returns_value`,
    ].join(",\n  ");
  const conditions = scopeConditions(p, f);
  const text = `select
  ${cols(cur, "")}${prev ? `,\n  ${cols(prev, "prev_")}` : ""}
from ${monthTable(f)}
${where(conditions)}`;
  return { text: text.trim(), values: p.values };
}

/** Revenue and orders for every month, for the country and category. */
export function monthlyQuery(f: Filters): Query {
  const p = new Params();
  const conditions = scopeConditions(p, f);
  return {
    text: `select to_char(month, 'YYYY-MM') as month, sum(revenue)::float8 as revenue, sum(orders)::float8 as orders
from ${monthTable(f)}
${where(conditions)}
group by month
order by month`.replace("\n\n", "\n"),
    values: p.values,
  };
}

/** Revenue, orders and returns by country for From–To and the category (countries and returns). */
export function countryTotalsQuery(f: Filters): Query {
  const p = new Params();
  const conditions = [monthRange(p, f.from, f.to), ...scopeConditions(p, { country: ALL, category: f.category })];
  return {
    text: `select country, sum(revenue)::float8 as revenue, sum(orders)::float8 as orders,
  sum(returns_value)::float8 as returns_value, sum(return_lines)::float8 as return_lines
from ${monthTable(f)}
${where(conditions)}
group by country`,
    values: p.values,
  };
}

/**
 * Top products for the exact From–To months and country, ranked within the category, with the
 * scope's product count and revenue across all categories (for shares).
 */
export function topProductsQuery(f: Filters, limit = 200): Query {
  const p = new Params();
  const scope = [monthRange(p, f.from, f.to), ...scopeConditions(p, f, { category: false })];
  const category = f.category !== ALL ? `and category = ${p.add(f.category)}` : "";
  const lim = p.add(limit);
  return {
    text: `with scoped as (
  select stock_code, category, units, revenue
  from ${S}.mv_product_month_country
  where ${scope.join(" and ")}
),
totals as (
  -- Products with sales (a product with only returns in the range doesn't count).
  select count(distinct stock_code) filter (where revenue > 0)::float8 as products, coalesce(sum(revenue), 0)::float8 as revenue
  from scoped
),
ranked as (
  select stock_code, sum(units)::float8 as units, sum(revenue)::float8 as revenue
  from scoped
  where true ${category}
  group by stock_code
  having sum(revenue) > 0
  order by sum(revenue) desc, stock_code
  limit ${lim}
)
select r.stock_code, coalesce(pr.description, r.stock_code) as description, coalesce(pr.category, 'Uncategorized') as category,
  r.units, r.revenue, t.products, t.revenue as total_revenue
from ranked r
cross join totals t
left join ${S}.products pr on pr.stock_code = r.stock_code
order by r.revenue desc, r.stock_code`,
    values: p.values,
  };
}

/** The Pareto curve (all categories): share of revenue from the top 1%, 2%, … 100% of products. */
export function paretoQuery(f: Filters): Query {
  const p = new Params();
  const scope = [monthRange(p, f.from, f.to), ...scopeConditions(p, f, { category: false })];
  return {
    text: `with per_product as (
  select stock_code, sum(revenue) as revenue
  from ${S}.mv_product_month_country
  where ${scope.join(" and ")}
  group by stock_code
  having sum(revenue) > 0
),
ranked as (
  select row_number() over (order by revenue desc, stock_code) as rk,
    count(*) over () as n,
    sum(revenue) over () as total,
    sum(revenue) over (order by revenue desc, stock_code rows between unbounded preceding and current row) as cum
  from per_product
)
select g.pct::int as pct, (r.cum / r.total)::float8 as share
from generate_series(1, 100) as g(pct)
join ranked r on r.rk = greatest(1, ceil(r.n * g.pct / 100.0))::bigint
order by g.pct`,
    values: p.values,
  };
}

/**
 * Bought together, for every filter: the top 10 products by revenue, then for each pair (and
 * each product with itself) the orders containing both, plus the scope's order count.
 */
export function basketQuery(f: Filters): Query {
  const p = new Params();
  // Each value once; the placeholders are reused in every CTE.
  const range = monthRange(p, f.from, f.to);
  const country = f.country !== ALL ? `country = ${p.add(f.country)}` : null;
  const category = f.category !== ALL ? `category = ${p.add(f.category)}` : null;
  const scope = [range, country, category].filter((c): c is string => c !== null);
  // Only the ten top products' lines are read from `sales` (via the stock_code index), so even
  // the whole period stays fast. Their category is fixed, so it needs no condition there.
  const lines = ["not s.is_return", `s.${range}`, ...(country ? [`s.${country}`] : [])];
  return {
    text: `with top as (
  select stock_code, row_number() over (order by sum(revenue) desc, stock_code) as rk
  from ${S}.mv_product_month_country
  where ${scope.join(" and ")}
  group by stock_code
  order by rk
  limit 10
),
baskets as (
  select distinct s.invoice, s.stock_code
  from ${S}.sales s
  join top using (stock_code)
  where ${lines.join(" and ")}
),
total as (
  select coalesce(sum(orders), 0)::float8 as orders from ${monthTable(f)} where ${scope.join(" and ")}
)
select a.stock_code as a, b.stock_code as b, ta.rk::int as a_rank, tb.rk::int as b_rank,
  coalesce(pa.description, a.stock_code) as a_description, coalesce(pb.description, b.stock_code) as b_description,
  count(*)::float8 as orders, (select orders from total) as total_orders
from baskets a
join baskets b on a.invoice = b.invoice and a.stock_code <= b.stock_code
join top ta on ta.stock_code = a.stock_code
join top tb on tb.stock_code = b.stock_code
left join ${S}.products pa on pa.stock_code = a.stock_code
left join ${S}.products pb on pb.stock_code = b.stock_code
group by a.stock_code, b.stock_code, ta.rk, tb.rk, pa.description, pb.description`,
    values: p.values,
  };
}

/**
 * Cohorts for the country (orders placed there) and category: a customer's cohort is their
 * first month with a matching order (looking back to the start of the data), and they count
 * as active in every later month with one. Only cohorts that start inside From–To.
 */
export function cohortsQuery(f: Filters): Query {
  const p = new Params();
  const to = p.add(monthDate(f.to));
  const from = p.add(monthDate(f.from));
  const scope = scopeConditions(p, f);
  return {
    text: `with activity as (
  select customer_id, month
  from ${S}.mv_customer_activity
  where month <= ${to}::date${scope.map((c) => ` and ${c}`).join("")}
  group by customer_id, month
),
firsts as (
  select customer_id, min(month) as cohort from activity group by customer_id
)
select to_char(fi.cohort, 'YYYY-MM') as cohort,
  ((extract(year from a.month) - extract(year from fi.cohort)) * 12
    + extract(month from a.month) - extract(month from fi.cohort))::int as months_since,
  count(*)::float8 as active
from activity a
join firsts fi using (customer_id)
where fi.cohort >= ${from}::date
group by fi.cohort, months_since
order by fi.cohort, months_since`,
    values: p.values,
  };
}

/** RFM segments over the whole period, for customers whose first order was in the country. */
export function segmentsQuery(f: Filters): Query {
  const p = new Params();
  const conditions = f.country !== ALL ? [`home_country = ${p.add(f.country)}`] : [];
  return {
    text: `select segment, count(*)::float8 as customers, avg(recency_days)::float8 as avg_recency_days,
  avg(orders)::float8 as avg_orders, avg(revenue)::float8 as avg_revenue
from ${S}.mv_rfm
${where(conditions)}
group by segment`.replace("\n\n", "\n"),
    values: p.values,
  };
}

/** Products whose description or code contains the text, with sales for the filters, best first. */
export function searchProductsQuery(query: string, f: Filters, limit = 25): Query {
  const p = new Params();
  const pattern = p.add(`%${escapeLike(query.trim())}%`);
  const range = monthRange(p, f.from, f.to, "m.month");
  const country = f.country !== ALL ? ` and m.country = ${p.add(f.country)}` : "";
  const category = f.category !== ALL ? ` and pr.category = ${p.add(f.category)}` : "";
  const lim = p.add(limit);
  return {
    text: `select pr.stock_code, coalesce(pr.description, pr.stock_code) as description, pr.category,
  coalesce(sum(m.units), 0)::float8 as units, coalesce(sum(m.revenue), 0)::float8 as revenue
from ${S}.products pr
left join ${S}.mv_product_month_country m on m.stock_code = pr.stock_code and ${range}${country}
where (pr.description ilike ${pattern} escape '\\' or pr.stock_code ilike ${pattern} escape '\\')${category}
group by pr.stock_code, pr.description, pr.category
order by revenue desc, pr.stock_code
limit ${lim}`,
    values: p.values,
  };
}

/** One product's name and category. */
export function productInfoQuery(code: string): Query {
  const p = new Params();
  return {
    text: `select stock_code, coalesce(description, stock_code) as description, category
from ${S}.products
where stock_code = ${p.add(code)}`,
    values: p.values,
  };
}

/** One product's units, revenue and orders per month, for the country filter. */
export function productMonthlyQuery(code: string, f: Filters): Query {
  const p = new Params();
  const conditions = [`stock_code = ${p.add(code)}`, ...scopeConditions(p, f, { category: false })];
  return {
    text: `select to_char(month, 'YYYY-MM') as month, sum(units)::float8 as units, sum(revenue)::float8 as revenue,
  sum(orders)::float8 as orders
from ${S}.mv_product_month_country
where ${conditions.join(" and ")}
group by month
order by month`,
    values: p.values,
  };
}
