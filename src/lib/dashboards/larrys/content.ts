/**
 * Copy shared by the dashboard page and its portfolio entry (src/data/dashboards.ts),
 * so the title, summary and source note read the same everywhere.
 *
 * The source note is the only place the data's class origin is mentioned; the same text
 * is meta.source in src/data/larrys-secret.json (and in scripts/build_larrys_data.py).
 */
export const RETAIL_DASHBOARD_PATH = "/work/dashboards/larrys-secret";

export const RETAIL_DASHBOARD_TITLE = "Larry’s Secret: retail sales dashboard";

export const RETAIL_DASHBOARD_SOURCE =
  "Data: Larry’s Secret case-study sales data from the Business Intelligence class at UMass Boston. Aggregated and anonymized; 554 duplicate lines removed.";

export const RETAIL_DASHBOARD_SUMMARY =
  "A sales dashboard for a five-store clothing chain: where revenue and margin come from, what customers buy together, and who should get a loyalty discount.";

export const RETAIL_DASHBOARD_DESCRIPTION =
  "An interactive sales dashboard for Larry’s Secret, a five-store clothing chain: store and product performance, products bought together, and a loyalty discount simulator. Built with React, TypeScript and D3.";

export const RETAIL_DASHBOARD_STACK = ["React", "TypeScript", "D3", "Next.js", "accessible charts"];
