# Online Retail: Postgres data source

An optional database for the Online Retail dashboard (`/work/dashboards/online-retail`). When
`ONLINE_RETAIL_DATABASE_URL` is set, the site reads from here (`postgresSource.ts`) and the dashboard shows
**live data**. That makes drill-downs possible that the committed snapshot can't answer: any product, exact
rankings for any country and month range, and basket and cohorts filtered by country and category together.
Without the variable, the site uses `src/data/online-retail/snapshot.json`, and the build, CI and e2e never need
a database.

| File | What it does |
| --- | --- |
| `001_schema.sql` | `online_retail` schema, `sales` (one row per cleaned invoice line) and `products` |
| `002_indexes.sql` | indexes for live queries, plus a trigram index for product search (`pg_trgm`) |
| `003_views.sql` | materialized views matching the `DataSource` methods: `mv_month_country`, `mv_month_country_category`, `mv_product_month_country`, `mv_customer_activity`, `mv_rfm` |
| `004_reader_role.sql` | `online_retail_reader`: read-only, this schema only, 5 s statement timeout |
| `load.sql` | loads the Phase 1 CSVs and refreshes the views (psql) |

The data stays in its own schema, not `public`: Supabase's auto-generated REST API only exposes `public`, so the
project's anon key can't read it. The site connects as `online_retail_reader`, which can only `select`.

## Setup

You need `psql` (PostgreSQL client 14+) on your machine. The SQL files themselves run anywhere.

1. Run the migrations in order as the database owner, in the Supabase SQL editor or with psql:
   ```sh
   psql "$ONLINE_RETAIL_ADMIN_URL" -f db/online-retail/001_schema.sql
   psql "$ONLINE_RETAIL_ADMIN_URL" -f db/online-retail/002_indexes.sql
   psql "$ONLINE_RETAIL_ADMIN_URL" -f db/online-retail/003_views.sql
   psql "$ONLINE_RETAIL_ADMIN_URL" -f db/online-retail/004_reader_role.sql
   ```
   `ONLINE_RETAIL_ADMIN_URL` is the owner's **direct** connection string (Supabase: Connect → Direct connection, port
   5432). Keep it in your shell only: it's never used by the site, and it doesn't belong in `.env.local` or Vercel.
2. Build the CSVs (git-ignored), then load them from the repo root:
   ```sh
   python scripts/build_online_retail_data.py data-raw/online_retail_II.xlsx src/data/online-retail
   psql "$ONLINE_RETAIL_ADMIN_URL" -f db/online-retail/load.sql
   ```
   About 1.02M lines; the load takes a few minutes. It ends by printing revenue, orders and returns, which must
   match `meta.revenue`, `meta.orders` and `meta.returnsValue` in `src/data/online-retail/snapshot.json`.
3. Give the reader role a password, once, in the SQL editor (never commit it):
   ```sql
   alter role online_retail_reader with login password '<a long random password>';
   ```
4. Point the site at it with the reader's connection string, through the **transaction pooler** (port 6543):
   ```
   ONLINE_RETAIL_DATABASE_URL=postgresql://online_retail_reader.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
   ```

## Reloading

`load.sql` replaces the tables and refreshes every view, so rerun it after rebuilding the CSVs. For a refresh
without blocking readers, the views have unique indexes:

```sql
refresh materialized view concurrently online_retail.mv_month_country;
-- …and the other four
```

## Checks

```sql
-- Totals: compare with the snapshot's meta.
select round(sum(revenue), 2) as revenue, sum(orders) as orders, round(sum(returns_value), 2) as returns
from online_retail.mv_month_country;

-- The reader can read but not write (run after `set role online_retail_reader;`).
select count(*) from online_retail.sales;          -- works
delete from online_retail.sales where false;        -- ERROR: permission denied
```

Segments use `ntile`, which breaks ties by customer ID, so a few customers on a quintile boundary can land one
score off from the Python build. Segment counts can differ from the snapshot by a handful.

## Size

About 1M rows in `sales`, roughly 250 MB with indexes and views. That fits Supabase's free plan (500 MB database).
