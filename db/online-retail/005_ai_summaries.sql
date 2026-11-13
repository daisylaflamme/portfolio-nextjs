-- "Summarize this view": a shared cache of summaries and a daily call counter, so the cost
-- guards hold across every server instance. These two tables are the only ones the site's
-- online_retail_reader role can write. Its sessions stay read-only by default
-- (default_transaction_read_only); the summary store opens an explicit READ WRITE
-- transaction for these writes only.

create table if not exists online_retail.ai_summaries (
  cache_key  text primary key,      -- tab | filters | model | prompt version
  summary    text not null,
  model      text not null,
  created_at timestamptz not null default now()
);

create table if not exists online_retail.ai_summary_usage (
  day   date primary key,           -- UTC day
  calls integer not null default 0
);

-- Select (to read the cache and return the counter), insert and update (the counter's upsert).
-- No delete, no truncate, and still nothing on sales, products or the views.
grant select, insert, update on online_retail.ai_summaries, online_retail.ai_summary_usage to online_retail_reader;
