# Online Retail II snapshot

Aggregated, server-only data for the Online Retail dashboard, built by `scripts/build_online_retail_data.py`.

- **Source:** Online Retail II, UCI Machine Learning Repository, CC BY 4.0 (<https://archive.ics.uci.edu/dataset/502/online+retail+ii>). A UK online gift retailer, 1 Dec 2009 – 9 Dec 2011, about 1.07M invoice lines in two sheets.
- **Outputs:**
  - `src/data/online-retail/snapshot.json` (aggregates only, kept under 1.5 MB)
  - `src/data/online-retail/categories.json` (StockCode → category)
  - CSVs for a later database load in `data-raw/out/` (git-ignored; these keep Customer ID)
- **Rebuild:**
  1. Put `online_retail_II.xlsx` in `data-raw/` (git-ignored; never commit it).
  2. `python -m pip install pandas openpyxl`
  3. `python scripts/build_online_retail_data.py data-raw/online_retail_II.xlsx src/data/online-retail`

  The script prints a cleaning report, including the lines each rule removed.

The snapshot contains no customer names (the source has none), no Customer IDs and no raw lines. Customer data appears only as counts and shares: cohorts, segments and the customer total.

## Cleaning rules

Rules apply in this order. Each rule's removed-line count is stored in `meta.rowsRemoved`.

0. Stock codes are upper-cased, so `85123a` and `85123A` are one product.
1. **duplicates:** exact duplicate lines are data errors and are dropped.
2. **nonProduct:** non-product stock codes are dropped:
   - postage (`POST`, `DOT`, `C2`, `C3`)
   - manual entries (`M`)
   - discounts (`D`)
   - samples (`S`)
   - bad-debt adjustments (`B`, `ADJUST`, `ADJUST2`)
   - bank and marketplace fees (`BANK CHARGES`, `AMAZONFEE`)
   - commissions (`CRUK`)
   - `PADS`
   - test lines (`TEST001`, `TEST002`)
   - gift vouchers (`GIFT_0001_*`)
   - any code with no digit in it
3. **adjustments:** invoices starting with `A` (bad-debt adjustments) are dropped.
4. **dataEntry:** these lines are dropped:
   - price ≤ 0
   - quantity 0
   - negative quantities on invoices that are not `C`, which are stock write-offs such as "damaged", "given away" and "printing smudges"
5. **Outliers:**
   - **outliersCancelledBulk:** a sale of 10,000+ units that was cancelled by a `C` line for the same code, customer and quantity is dropped together with that cancellation. Examples are 74,215 storage jars and 80,995 paper crafts. Real bulk orders that weren't cancelled are kept.
   - **outliersPrice:** lines priced above 100× their stock code's median price are dropped. These are manual price entries, such as a car flag at £1,157.15 against a median of £0.42. Single-unit retail prices up to about 50× a code's bulk price are normal in this data and are kept.
6. **Cancellations:** `C` invoices are kept as **returns, not sales**.
   - They feed `returnsValue` (|quantity × price|) and `returnLines` in the cancellation's own month and country.
   - They never count toward revenue, units or orders.
7. **Guest purchases:** lines without a Customer ID count in revenue, units and orders. They are excluded from customer metrics (customer counts, cohorts, segments).
8. **Revenue** = Quantity × Price in GBP, sales lines only, with no currency conversion.

An invoice's month and country are those of its first line. In this data, no invoice spans two countries or two months.

## Additivity

Orders and customers are **distinct counts**:

- **Orders** add up across months and countries, because an invoice has one date and one country. They do **not** add up across categories, because one invoice can contain several. So the category filter is **single-select**, and `monthCountryCategory.orders` means "invoices containing this category".
- **Customers** never add up across months or countries. The total is `meta.customers`.
- **Revenue, units and returns** add up everywhere. Category revenue sums to the month × country revenue exactly: any rounding remainder goes to the largest category in that cell.

## Tables

Large tables are stored as `{ columns, rows }`, with tuples in column order. Product descriptions appear once, in `products`.

| Table | Grain | Notes |
| --- | --- | --- |
| `monthCountry` | month × country | revenue, units, orders, returnsValue, returnLines |
| `monthCountryCategory` | month × country × category | same columns; orders = invoices containing the category |
| `topProducts` | scope × year × code | top 200 by revenue per scope ("all" or a country) and calendar year (2009 is December only; 2011 ends 9 December) |
| `basketTopProducts` / `basketTopPairs` | scope × product / pair | top 10 products by revenue for "all" and the top-5 countries; share = orders containing the product (or both products) ÷ all orders in the scope |
| `cohorts` | scope × cohort month × months since | cohort = month of the first order; a customer's country is that order's country; share = customers ordering N months later ÷ cohort size |
| `segments` | scope × RFM segment | customers, share, average recency, orders and revenue |

## RFM segments

RFM covers customers with an ID, sales only. The reference date is the day after the last invoice.

**Scores:** each customer gets R, F and M scores from 1 to 5, by quintile of rank. Rank-first ordering splits ties evenly.

- R: days since last order (fewer is better)
- F: number of orders
- M: revenue

FM = (F + M) / 2, rounded half up.

| Segment | Rule |
| --- | --- |
| Champions | R ≥ 4 and FM ≥ 4 |
| Loyal | R ≥ 3 and FM ≥ 3, not Champions |
| Promising | R ≥ 3 and FM ≤ 2 |
| At risk | R ≤ 2 and FM ≥ 3 |
| Lost | R ≤ 2 and FM ≤ 2 |

Every customer falls in exactly one segment.

## Categories

The dataset has no categories.

- Each stock code gets one category from its most frequent description, using the ordered keyword rules in `CATEGORY_RULES`. The first match wins.
- No LLM is used. `categories.json` records `method: "keyword rules v1 (no LLM)"`.
- Codes that match no rule are `Uncategorized`. The script lists them, by revenue, in `data-raw/out/uncategorized.csv`.
- Keyword rules can misfile a product; for example, "washing up gloves" lands in Jewellery & accessories through "glove". If a reviewed LLM pass replaces them later, `method` will change and the page will say so.
