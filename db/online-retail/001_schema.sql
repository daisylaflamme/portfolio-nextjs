-- Online Retail II: tables for the dashboard's live data source.
-- Everything lives in its own schema, not `public`: Supabase's auto-generated REST API only
-- exposes `public`, so the project's anon key can never reach this data.
-- Run as the database owner (Supabase: the SQL editor or the `postgres` user).

create schema if not exists online_retail;

-- One row per cleaned invoice line, from data-raw/out/lines_clean.csv (built by
-- scripts/build_online_retail_data.py, with the cleaning rules in its README).
create table if not exists online_retail.sales (
  id           bigint generated always as identity primary key,
  invoice      text      not null,
  stock_code   text      not null,
  quantity     integer   not null,       -- negative on returns
  price        numeric   not null,       -- GBP per unit
  invoice_date timestamp not null,
  month        date      not null,       -- first day of the invoice's month (one per invoice)
  customer_id  integer,                  -- null for guest purchases
  country      text      not null,       -- the invoice's country (one per invoice)
  category     text      not null,       -- from categories.json (keyword rules)
  is_return    boolean   not null,       -- cancellation ("C") invoices
  revenue      numeric generated always as (quantity * price) stored
);

comment on table online_retail.sales is
  'Online Retail II (UCI Machine Learning Repository, CC BY 4.0), cleaned. Revenue = quantity x price; returns have negative quantity.';

-- One row per stock code: its most frequent description and its category.
create table if not exists online_retail.products (
  stock_code  text primary key,
  description text,
  category    text not null
);
