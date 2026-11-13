-- Indexes for the live queries that read `sales` directly (basket pairs) and for product search.
-- The other queries read the materialized views in 003_views.sql, which have their own indexes.

create index if not exists sales_month_country_idx on online_retail.sales (month, country);
create index if not exists sales_stock_month_idx   on online_retail.sales (stock_code, month);
create index if not exists sales_invoice_idx       on online_retail.sales (invoice);
create index if not exists sales_customer_month_idx
  on online_retail.sales (customer_id, month) where customer_id is not null;

-- Trigram index so `description ilike '%lantern%'` doesn't scan every product.
-- Supabase keeps extensions in their own schema; elsewhere this creates it.
create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create index if not exists products_description_trgm_idx
  on online_retail.products using gin (description extensions.gin_trgm_ops);
