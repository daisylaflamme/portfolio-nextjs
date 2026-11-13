-- A read-only role for the website. It can read the online_retail schema and nothing else.
-- It is created without a login; give it a password once, by hand, in the SQL editor
-- (never commit it):
--   alter role online_retail_reader with login password '<a long random password>';

do $$
begin
  if not exists (select from pg_roles where rolname = 'online_retail_reader') then
    create role online_retail_reader nologin;
  end if;
end
$$;

grant usage on schema online_retail to online_retail_reader;
grant select on all tables in schema online_retail to online_retail_reader;
-- Materialized views, explicitly (not every Postgres version counts them in "all tables").
grant select on online_retail.mv_month_country,
                online_retail.mv_month_country_category,
                online_retail.mv_product_month_country,
                online_retail.mv_customer_activity,
                online_retail.mv_rfm
  to online_retail_reader;
-- Tables and views created later in the schema are readable too, still never writable.
alter default privileges in schema online_retail grant select on tables to online_retail_reader;

-- Nothing anywhere else: no public schema objects, no writes.
revoke all on schema public from online_retail_reader;
revoke insert, update, delete, truncate on all tables in schema online_retail from online_retail_reader;

-- Guard rails for every connection the site opens.
alter role online_retail_reader set statement_timeout = '5s';
alter role online_retail_reader set default_transaction_read_only = on;
alter role online_retail_reader set search_path = online_retail;
