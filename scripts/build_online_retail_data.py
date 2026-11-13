"""
Build the aggregated, server-only snapshot for the Online Retail dashboard.
Input:  online_retail_II.xlsx, both sheets ("Year 2009-2010", "Year 2010-2011"). Source: Online Retail II,
        UCI Machine Learning Repository, CC BY 4.0 (https://archive.ics.uci.edu/dataset/502/online+retail+ii).
Output: <outdir>/snapshot.json and <outdir>/categories.json (aggregates only: no customer IDs, no raw lines),
        plus CSVs for a later database load in <xlsx folder>/out/ (git-ignored; these do keep Customer ID).
Usage:  python scripts/build_online_retail_data.py data-raw/online_retail_II.xlsx src/data/online-retail
        Reading the workbook takes about a minute; the parsed sheets are cached in out/raw.pkl and reused while the
        cache is newer than the workbook.

Cleaning rules, applied in this order (lines removed by each are printed and stored in meta.rowsRemoved):
  0. Stock codes are upper-cased ("85123a" and "85123A" are one product).
  1. duplicates:   exact duplicate lines are dropped as data errors (same rule as the Larry's Secret build).
  2. nonProduct:   non-product stock codes are dropped: postage (POST, DOT, C2, C3), manual entries (M), discounts (D),
                   samples (S), bad-debt adjustments (B, ADJUST, ADJUST2), bank and marketplace fees (BANK CHARGES,
                   AMAZONFEE), commissions (CRUK), PADS, test lines (TEST001, TEST002), gift vouchers (GIFT_0001_*),
                   and any code with no digit in it. The distinct codes removed are printed.
  3. adjustments:  invoices starting with "A" (bad-debt adjustments) are dropped.
  4. dataEntry:    lines with price <= 0 or quantity 0, and negative quantities on invoices that are not "C"
                   (stock write-offs such as "damaged", "given away", "printing smudges").
  5. outliers:     (a) a sale of 10,000 or more units that was cancelled by a "C" line for the same code, customer and
                   quantity (e.g. 74,215 storage jars and 80,995 paper crafts) is dropped together with that
                   cancellation; real bulk orders that were not cancelled are kept.
                   (b) a line priced above 100x the median price of its stock code (manual price entries such as a
                   car flag at 1,157.15 GBP against a median 0.42, or 60 picnic baskets at 649.50 against 5.95). Single-unit
                   retail prices up to ~50x a code's bulk price are normal in this data and are kept. Every outlier
                   line is printed.
  6. Cancellations ("C" invoices) are kept as returns, not sales: they feed returnsValue (|quantity x price|) and
     returnLines in the cancellation's own month and country, and never count toward revenue, units or orders.
  7. Lines without a Customer ID are guest purchases: they count in revenue, units and orders, and are excluded from
     customer metrics (customer counts, cohorts, segments).
  8. Revenue = Quantity x Price in GBP, sales lines only. No currency conversion.
An invoice's month and country are those of its first line, so every order has exactly one of each.

Additivity: orders and customers are distinct counts. Orders add up across months and countries (an invoice has one
date and one country) but NOT across categories (one invoice can contain several), so the category filter is
single-select. Customers never add up across months or countries.

Categories: the dataset has none. Each stock code gets one category from its most frequent description through the
ordered keyword rules in CATEGORY_RULES (first match wins; no LLM). Codes that match no rule are "Uncategorized".

RFM segments (customers with an ID, sales only): reference date = the day after the last invoice. R (days since last
order, fewer is better), F (orders) and M (revenue) are each scored 1-5 by quintile of their rank (rank-first, so ties
split evenly). FM = (F + M) / 2 rounded half up. Champions R>=4 and FM>=4; Loyal R>=3 and FM>=3 (not Champions);
Promising R>=3 and FM<=2; At risk R<=2 and FM>=3; Lost R<=2 and FM<=2. Every customer falls in exactly one.

Year spans (products): for "all" and the top-5 countries, every contiguous span of calendar years gets its product
count, an exact top 200 and a revenue Pareto curve (share of revenue from the top 1%, 2%, ... 100% of products).

Cohorts: a customer's cohort is the month of their first order, and their country is that order's country (customers
in a country scope are followed across all their later orders). Retention share = customers with an order in month
N after the cohort month / cohort size.
"""
import sys, os, re, json
import numpy as np
import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")

src, outdir = sys.argv[1], sys.argv[2]
csvdir = os.path.join(os.path.dirname(os.path.abspath(src)), "out")
os.makedirs(outdir, exist_ok=True)
os.makedirs(csvdir, exist_ok=True)

COLUMNS = {"Invoice": "invoice", "StockCode": "code", "Description": "desc", "Quantity": "qty",
           "InvoiceDate": "date", "Price": "price", "Customer ID": "customer", "Country": "country"}
cache = os.path.join(csvdir, "raw.pkl")
if os.path.exists(cache) and os.path.getmtime(cache) > os.path.getmtime(src):
    raw = pd.read_pickle(cache)
else:
    sheets = pd.read_excel(src, sheet_name=None, dtype={"Invoice": str, "StockCode": str})
    raw = pd.concat(sheets.values(), ignore_index=True)
    raw.to_pickle(cache)
raw = raw.rename(columns=COLUMNS)[list(COLUMNS.values())]
raw["code"] = raw["code"].str.strip().str.upper()

removed, d = {}, raw.copy()
def drop(rule, mask, show=None):
    global d
    removed[rule] = int(mask.sum())
    if show is not None:
        print(f"\n[{rule}]\n" + show(d[mask]))
    d = d[~mask].copy()

# 1. duplicates
drop("duplicates", d.duplicated())
# 2. non-product stock codes
NON_PRODUCT = {"POST", "DOT", "C2", "C3", "M", "D", "S", "B", "BANK CHARGES", "AMAZONFEE", "CRUK", "PADS"}
code = d["code"]
nonprod = code.isin(NON_PRODUCT) | ~code.str.contains(r"\d") | code.str.match(r"^(ADJUST|TEST|GIFT_)")
drop("nonProduct", nonprod, lambda x: x.groupby("code").agg(lines=("qty", "size"), description=("desc", "first"))
     .sort_values("lines", ascending=False).to_string())
# 3. bad-debt adjustment invoices
drop("adjustments", d["invoice"].str.startswith("A"))
# 4. data-entry lines
is_c = d["invoice"].str.startswith("C")
drop("dataEntry", (d["price"] <= 0) | (d["qty"] == 0) | ((d["qty"] < 0) & ~is_c))
# 5a. huge sales that were cancelled, with their cancellations
is_c = d["invoice"].str.startswith("C")
big = d[(d["qty"] >= 10000) & ~is_c]
keys = set(zip(big["code"], big["customer"], big["qty"]))
cancel_keys = {k for k in zip(d.loc[is_c, "code"], d.loc[is_c, "customer"], -d.loc[is_c, "qty"]) if k in keys}
k_all = pd.Series(list(zip(d["code"], d["customer"], d["qty"].abs())), index=d.index)
cancelled_big = k_all.isin(cancel_keys) & (d["qty"].abs() >= 10000)
# 5b. price outliers against each code's median price
median_price = d.groupby("code")["price"].transform("median")
price_out = d["price"] > 100 * median_price
outliers = cancelled_big | price_out
removed["outliersCancelledBulk"] = int(cancelled_big.sum())
removed["outliersPrice"] = int((price_out & ~cancelled_big).sum())
show = d[outliers].assign(median=median_price[outliers], rule=np.where(cancelled_big[outliers], "5a", "5b"))
print("\n[outliers]\n" + show[["rule", "invoice", "code", "desc", "qty", "price", "median", "date", "country"]]
      .sort_values(["rule", "date"]).to_string())
d = d[~outliers].copy()

# Shared columns. An invoice's month and country come from its first line.
d["is_return"] = d["invoice"].str.startswith("C")
d["revenue"] = (d["qty"] * d["price"]).round(4)
first = d.sort_values("date").groupby("invoice").agg(inv_date=("date", "first"), inv_country=("country", "first"))
multi = d.groupby("invoice").agg(c=("country", "nunique"), m=("date", lambda s: s.dt.strftime("%Y-%m").nunique()))
d = d.join(first, on="invoice")
d["month"] = d["inv_date"].dt.strftime("%Y-%m")
d["year"] = d["inv_date"].dt.year
d["country"] = d["inv_country"]
sales, returns = d[~d["is_return"]].copy(), d[d["is_return"]].copy()
returns["returnValue"] = returns["revenue"].abs()

# ---- Categories: ordered keyword rules on each code's most frequent description --------------------------------
CATEGORY_RULES = [
    ("Christmas & seasonal", r"CHRISTMAS|XMAS|ADVENT|SANTA|REINDEER|SNOWMAN|SNOWFLAKE|BAUBLE|NATIVITY|EASTER|HALLOWEEN|STAR TREE|TREE DECORATION|ANGEL"),
    ("Party & gift wrap", r"\bWRAP|GIFT BAG|PARTY|BUNTING|NAPKIN|PAPER CUPS?|PAPER PLATES?|BALLOON|RIBBON|GIFT TAPE|CONFETTI|TISSUE PAPER|GIFT BOX"),
    ("Toys & kids", r"\bTOYS?\b|\bDOLL|GAME|JIGSAW|PUZZLE|SPACEBOY|PLAYING CARDS|CHILDRENS|CHILD'?S|\bKIDS?\b|BABY|TEDDY|SKITTLES|DOMINO|SOLDIER|SKIPPING|\bKITE|SNAKES|MONEY BANK|SPINNING TOP|MARBLES|BUILDING BLOCK|CIRCUS|DINOSAUR|PIRATE|TRAIN|TOADSTOOL|CHILDREN|BINGO|LUDO|NAUGHTS|NOUGHTS|PLAYHOUSE|PIGGY BANK|INFLATABLE|TATTOO|COOKING SET|HAPPY STENCIL|SPACE ?CADET|SOMBRERO"),
    ("Candles & lighting", r"CANDLE|T-?LIGHT|LANTERN|\bLAMP|LIGHTS?\b|\bLED\b|NIGHT LIGHT|INCENSE|OIL BURNER|MATCHES"),
    ("Bags & purses", r"\bBAGS?\b|PURSE|SHOPPER|\bTOTE|HANDBAG|BACKPACK|RUCKSACK|WALLET"),
    ("Jewellery & accessories", r"NECKLACE|NECKLAGE|BRACELET|EARRING|\bRING\b|BROOCH|\bHAIR|CLIP|BANGLE|CHARM|KEY ?RING|SCARF|\bHAT\b|GLOVE|SUNGLASSES|\bWATCH|JEWEL|DIAMANTE|BEAD|PENDANT|UMBRELLA|PONCHO|SLIPPER|KEY FOB|\bFAN\b|\bBADGE|LUGGAGE TAG"),
    ("Bath & beauty", r"SOAP|\bBATH|TOWEL|TOOTHBRUSH|MIRROR|TISSUES|\bLIP|\bNAIL|COSMETIC|\bWASH|HOT WATER BOTTLE|HAND WARMER|FLANNEL|SPONGE|PLASTERS"),
    ("Kitchen & dining", r"\bMUGS?\b|\bCUPS?\b|SAUCER|\bPLATES?\b|\bBOWLS?\b|TEA|COFFEE|CAKE|BAKING|KITCHEN|APRON|OVEN|\bTRAYS?\b|\bJUG|GLASS|BOTTLE|CUTLERY|SPOON|FORK|KNIFE|LUNCH|\bJAM|RECIPE|\bEGG|CHOPPING|COASTER|PLACEMAT|DOILY|BISCUIT|BREAD|BEAKER|TUMBLER|PANTRY|MILK|SUGAR|CHOPSTICK|MOULD|COOKIE|SPICE|\bDISH|PICNIC|FOOD|ICE LOLLY|CHOCOLATE|SWEETIE|POPCORN|CUTTER|STRAWS|NAPKIN|CRUET|DRINK|WINE|SALAD|SNACK|LADLE|COLANDER|TEAPOT|CAFETIERE|FRYING PAN|\bPAN\b|SAUCEPAN|TEA TOWEL|THERMOS|FLASK|PLACE ?SETTING"),
    ("Stationery & craft", r"\bCARDS?\b|NOTEBOOK|\bPENS?\b|PENCIL|ERASER|RUBBER|STICKER|JOURNAL|DIARY|CALENDAR|ENVELOPE|\bNOTE|MEMO|\bBOOK|PAPER|CRAYON|CHALK|RULER|SHARPENER|STAMP|SCISSORS|MAGNET|WRITING|ORGANISER|PHOTO ALBUM|ALBUM|TAPE|PAD\b|STENCIL|COLOURING|BOOKMARK|PASSPORT|STATIONERY|SEWING|KNITTING|FELTCRAFT|PAINT SET|PAINT YOUR OWN|MODELLING|CANVAS|IRON ON|PATCHES|CRAFT|EMBROIDERY|CROCHET|GLITTER|\bGLUE"),
    ("Garden & outdoor", r"GARDEN|WATERING|BIRD ?FEEDER|BIRD ?HOUSE|BIRD TABLE|\bPLANT|FLOWER ?POT|\bPOTS?\b|PLANTER|SEED|\bHERB|PARASOL|WINDMILL|GNOME|HAMMOCK|TROWEL|FORK AND|SPADE|OUTDOOR|WIND CHIME|BEACH|BUCKET|SUN ?HAT|WELLY|WEATHER|THERMOMETER|BIRD BATH|NEST BOX|SANDCASTLE|WHEELBARROW"),
    ("Storage & organisation", r"\bBOX(ES)?\b|\bTINS?\b|\bJARS?\b|BASKET|DRAWER|CABINET|STORAGE|\bHOOKS?\b|\bRACK|HANGER|\bPEGS?\b|CRATE|TRUNK|CASE\b|HOLDER|CADDY|BIN\b|CONTAINER|SHELF|TIDY|CHEST|KEY CABINET|COAT|CASES\b|PHOTO CUBE|POUFFE|BOOK ?END"),
    ("Home décor & signs", r"SIGN|PLAQUE|FRAME|CUSHION|DOORMAT|\bMAT\b|CLOCK|WALL|ORNAMENT|HEART|DECORATION|HANGING|VASE|WREATH|GARLAND|\bDOOR|CURTAIN|THROW|QUILT|DOORSTOP|\bBELL|CHIME|FEATHER|LOVE|HOME|BIRD|BUTTERFLY|FLOWER|ROSE|CHANDELIER|DECORATIVE|DECOUPAGE|BLACKBOARD|CHALKBOARD|MOBILE|PAINTED|CERAMIC|ZINC|METAL|WOODEN|ENAMEL|GLASS|FAIRY|HANGER|WICKER|LACE|SPOTTY|POLKADOT|FLYING DUCKS|BLACK ?BOARD|\bCUBE\b|DOORKNOB|KNOB|FAIRY|CHRYSANTHEMUM|GLOBE|\bSTAR\b|COLLAGE|PICTURE|PRINT\b|CANDY ?STRIPE"),
]
UNCATEGORIZED = "Uncategorized"
CATEGORIES = [c for c, _ in CATEGORY_RULES] + [UNCATEGORIZED]
compiled = [(c, re.compile(p)) for c, p in CATEGORY_RULES]
def categorize(desc):
    text = str(desc).upper()
    return next((c for c, rx in compiled if rx.search(text)), UNCATEGORIZED)

desc_mode = (d.dropna(subset=["desc"]).groupby(["code", "desc"]).size().reset_index(name="n")
             .sort_values(["code", "n"], ascending=[True, False]).drop_duplicates("code")
             .set_index("code")["desc"].str.strip().str.replace(r"\s+", " ", regex=True))
products = pd.DataFrame({"code": sorted(d["code"].unique())})
products["description"] = products["code"].map(desc_mode).fillna("")
products["category"] = products["description"].map(categorize)
cat_of = products.set_index("code")["category"]
d["category"] = d["code"].map(cat_of)
sales["category"] = sales["code"].map(cat_of)
returns["category"] = returns["code"].map(cat_of)

# ---- Aggregates ---------------------------------------------------------------------------------------------------
def by(keys, s, r):
    a = s.groupby(keys).agg(revenue=("revenue", "sum"), units=("qty", "sum"), orders=("invoice", "nunique"))
    b = r.groupby(keys).agg(returnsValue=("returnValue", "sum"), returnLines=("qty", "size"))
    out = a.join(b, how="outer").fillna(0).reset_index()
    for c in ["units", "orders", "returnLines"]:
        out[c] = out[c].astype(int)
    return out.round({"revenue": 2, "returnsValue": 2})

mc = by(["month", "country"], sales, returns)
mcc = by(["month", "country", "category"], sales, returns)
# Make category revenue add up to the rounded month x country revenue exactly: give the rounding remainder to the
# largest category in each cell (at most a few pence).
for col in ["revenue", "returnsValue"]:
    diff = (mc.set_index(["month", "country"])[col] - mcc.groupby(["month", "country"])[col].sum()).round(2)
    top = mcc.sort_values(col, ascending=False).drop_duplicates(["month", "country"]).set_index(["month", "country"])
    for key, delta in diff[diff != 0].items():
        idx = mcc.index[(mcc["month"] == key[0]) & (mcc["country"] == key[1]) & (mcc["category"] == top.loc[key, "category"])]
        mcc.loc[idx, col] = round(float(mcc.loc[idx, col].iloc[0]) + float(delta), 2)

country_rev = sales.groupby("country")["revenue"].sum().sort_values(ascending=False)
top5 = list(country_rev.index[:5])
scopes_all = ["all"] + list(country_rev.index)
scopes_top = ["all"] + top5
def scoped(df, scope):
    return df if scope == "all" else df[df["country"] == scope]

# Top products per scope x year
tp_rows = []
for scope in scopes_all:
    s = scoped(sales, scope)
    g = s.groupby(["year", "code"]).agg(units=("qty", "sum"), revenue=("revenue", "sum")).reset_index()
    g = g.sort_values(["year", "revenue"], ascending=[True, False]).groupby("year").head(200)
    tp_rows += [[scope, int(r.year), r.code, int(r.units), round(float(r.revenue), 2)] for r in g.itertuples()]

# Year spans for "all" and the top-5 countries: every contiguous run of calendar years (2009, 2009-2010, ...).
# For each: the product count, the revenue Pareto curve (cumulative share of revenue held by the top 1%, 2%, ...
# 100% of products, ranked by revenue) and an exact top 200, so a multi-year range ranks products exactly.
years = sorted(int(y) for y in sales["year"].unique())
spans = [(a, b) for i, a in enumerate(years) for b in years[i:]]
span_rows, curve_rows, tps_rows = [], [], []
for scope in scopes_top:
    s_scope = scoped(sales, scope)
    for a, b in spans:
        s = s_scope[(s_scope["year"] >= a) & (s_scope["year"] <= b)]
        g = (s.groupby("code").agg(units=("qty", "sum"), revenue=("revenue", "sum"))
             .sort_values("revenue", ascending=False).reset_index())
        n, total = len(g), float(g["revenue"].sum())
        cum = g["revenue"].cumsum().to_numpy() / total
        curve = [round(float(cum[max(0, int(np.ceil(n * p / 100)) - 1)]), 4) for p in range(1, 101)]
        span_rows.append([scope, a, b, int(n), round(total, 2)])
        curve_rows.append([scope, a, b, curve])
        tps_rows += [[scope, a, b, r.code, int(r.units), round(float(r.revenue), 2)] for r in g.head(200).itertuples()]

# Basket pairs: top 10 products by revenue per scope; share = orders with both / orders in scope
pair_rows, share_rows = [], []
for scope in scopes_top:
    s = scoped(sales, scope)
    n_orders = s["invoice"].nunique()
    top10 = list(s.groupby("code")["revenue"].sum().sort_values(ascending=False).index[:10])
    m = (pd.crosstab(s["invoice"], s["code"]).reindex(columns=top10, fill_value=0) > 0).astype(int)
    co = m.T.dot(m)
    for i, a in enumerate(top10):
        share_rows.append([scope, a, int(co.loc[a, a]), round(co.loc[a, a] / n_orders, 4)])
        for b in top10[i + 1:]:
            pair_rows.append([scope, a, b, int(co.loc[a, b]), round(co.loc[a, b] / n_orders, 4)])

# Customers (ID only): first order, cohorts, RFM
cs = sales.dropna(subset=["customer"])
inv = cs.groupby("invoice").agg(customer=("customer", "first"), date=("inv_date", "first"),
                                country=("country", "first"), revenue=("revenue", "sum"))
firsts = inv.sort_values("date").groupby("customer").agg(first=("date", "first"), home=("country", "first"))
firsts["cohort"] = firsts["first"].dt.strftime("%Y-%m")
def mindex(ts): return ts.dt.year * 12 + ts.dt.month
inv = inv.join(firsts, on="customer")
inv["since"] = mindex(inv["date"]) - mindex(inv["first"])
cohort_rows = []
for scope in scopes_top:
    x = inv if scope == "all" else inv[inv["home"] == scope]
    size = x.groupby("cohort")["customer"].nunique()
    act = x.groupby(["cohort", "since"])["customer"].nunique().reset_index(name="active")
    cohort_rows += [[scope, r.cohort, int(size[r.cohort]), int(r.since), int(r.active),
                     round(r.active / size[r.cohort], 4)] for r in act.itertuples()]

ref = d["date"].max().normalize() + pd.Timedelta(days=1)
rfm = inv.groupby("customer").agg(last=("date", "max"), orders=("date", "size"), revenue=("revenue", "sum"))
rfm = rfm.join(firsts[["home", "cohort"]])
rfm["recencyDays"] = (ref - rfm["last"]).dt.days
def score(series, ascending=True):
    return pd.qcut(series.rank(method="first", ascending=ascending), 5, labels=[1, 2, 3, 4, 5]).astype(int)
rfm["R"] = score(rfm["recencyDays"], ascending=False)
rfm["F"] = score(rfm["orders"])
rfm["M"] = score(rfm["revenue"])
rfm["FM"] = np.floor((rfm["F"] + rfm["M"]) / 2 + 0.5).astype(int)
SEGMENTS = ["Champions", "Loyal", "Promising", "At risk", "Lost"]
rfm["segment"] = np.select(
    [(rfm.R >= 4) & (rfm.FM >= 4), (rfm.R >= 3) & (rfm.FM >= 3), (rfm.R >= 3), (rfm.FM >= 3)],
    ["Champions", "Loyal", "Promising", "At risk"], "Lost")
seg_rows = []
for scope in scopes_top:
    x = rfm if scope == "all" else rfm[rfm["home"] == scope]
    for seg in SEGMENTS:
        y = x[x["segment"] == seg]
        seg_rows.append([scope, seg, int(len(y)), round(len(y) / len(x), 4),
                         round(float(y["recencyDays"].mean()), 1) if len(y) else 0,
                         round(float(y["orders"].mean()), 2) if len(y) else 0,
                         round(float(y["revenue"].mean()), 2) if len(y) else 0])

# ---- Output -------------------------------------------------------------------------------------------------------
def table(columns, rows): return {"columns": columns, "rows": rows}
def df_rows(df, cols): return [[v.item() if hasattr(v, "item") else v for v in row] for row in df[cols].itertuples(index=False)]

used = {r[2] for r in tp_rows} | {r[3] for r in tps_rows} | {r[1] for r in share_rows}
guest_orders = int(sales.loc[sales["customer"].isna(), "invoice"].nunique())
mc_cols = ["month", "country", "revenue", "units", "orders", "returnsValue", "returnLines"]
mcc_cols = ["month", "country", "category", "revenue", "units", "orders", "returnsValue", "returnLines"]
snapshot = {
    "meta": {
        "title": "Online Retail II: sales snapshot",
        "source": "Online Retail II, UCI Machine Learning Repository, CC BY 4.0",
        "sourceUrl": "https://archive.ics.uci.edu/dataset/502/online+retail+ii",
        "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
        "currency": "GBP",
        "dateRange": [d["date"].min().strftime("%Y-%m-%d"), d["date"].max().strftime("%Y-%m-%d")],
        "months": sorted(d["month"].unique().tolist()),
        "yearNote": "Years are calendar years: 2009 covers December only and 2011 ends on 9 December.",
        "rawLines": int(len(raw)), "rowsRemoved": removed, "cleanLines": int(len(d)),
        "salesLines": int(len(sales)), "returnLines": int(len(returns)),
        "invoices": int(d["invoice"].nunique()), "orders": int(sales["invoice"].nunique()), "guestOrders": guest_orders,
        "customers": int(len(rfm)), "products": int(products.shape[0]),
        "revenue": round(float(sales["revenue"].sum()), 2), "units": int(sales["qty"].sum()),
        "returnsValue": round(float(returns["returnValue"].sum()), 2),
        "countries": list(country_rev.index), "topCountries": top5,
        "categories": CATEGORIES, "categoryMethod": "keyword rules v1 (no LLM)",
        "additivity": ("Orders and customers are distinct counts. Orders add up across months and countries (an invoice "
                       "has one date and one country) but not across categories, because one invoice can contain "
                       "several; the category filter is single-select. Customers never add up across months or countries."),
        "cleaningRules": ["Exact duplicate lines removed.",
                          "Non-product stock codes removed (postage, manual entries, discounts, samples, fees, adjustments, test lines, gift vouchers).",
                          "Bad-debt adjustment invoices (\"A\") removed.",
                          "Lines with price <= 0 or quantity 0, and negative quantities outside cancellations, removed.",
                          "Sales of 10,000+ units cancelled at once, with their cancellations, and lines priced above 100x their code's median removed.",
                          "Cancellations (\"C\" invoices) kept as returns, not sales.",
                          "Lines without a Customer ID count in revenue and orders, not in customer metrics.",
                          "Revenue = Quantity x Price in GBP, no currency conversion."],
        "rfmRules": {"referenceDate": ref.strftime("%Y-%m-%d"),
                     "scores": "R (days since last order, fewer is better), F (orders) and M (revenue) are scored 1-5 by quintile of rank (rank-first). FM = (F + M) / 2 rounded half up.",
                     "segments": {"Champions": "R >= 4 and FM >= 4", "Loyal": "R >= 3 and FM >= 3, not Champions",
                                  "Promising": "R >= 3 and FM <= 2", "At risk": "R <= 2 and FM >= 3", "Lost": "R <= 2 and FM <= 2"}},
        "cohortRule": "Cohort = month of a customer's first order; country = that order's country. Share = customers ordering N months later / cohort size.",
        "productSpanRule": ("For all countries and the top-5 countries, every contiguous span of calendar years has its "
                            "product count, an exact top 200 and a Pareto curve: curve[i] is the share of revenue "
                            "from the top (i + 1)% of products by revenue. Other countries have per-year top 200s only."),
        "basketRule": "Top 10 products by revenue per scope. share = orders containing both / all orders in the scope.",
    },
    "products": {c: desc_mode.get(c, "") for c in sorted(used)},
    "monthCountry": table(mc_cols, df_rows(mc, mc_cols)),
    "monthCountryCategory": table(mcc_cols, df_rows(mcc, mcc_cols)),
    "topProducts": table(["scope", "year", "code", "units", "revenue"], tp_rows),
    "productSpans": table(["scope", "fromYear", "toYear", "products", "revenue"], span_rows),
    "productCurves": table(["scope", "fromYear", "toYear", "curve"], curve_rows),
    "topProductsSpan": table(["scope", "fromYear", "toYear", "code", "units", "revenue"], tps_rows),
    "basketTopProducts": table(["scope", "code", "orders", "share"], share_rows),
    "basketTopPairs": table(["scope", "a", "b", "orders", "share"], pair_rows),
    "cohorts": table(["scope", "cohort", "size", "monthsSince", "active", "share"], cohort_rows),
    "segments": table(["scope", "segment", "customers", "share", "avgRecencyDays", "avgOrders", "avgRevenue"], seg_rows),
}
snap_path = os.path.join(outdir, "snapshot.json")
with open(snap_path, "w", encoding="utf-8") as f:
    json.dump(snapshot, f, ensure_ascii=False, separators=(",", ":"))
categories = {"method": "keyword rules v1 (no LLM)", "categories": CATEGORIES,
              "codes": dict(zip(products["code"], products["category"]))}
with open(os.path.join(outdir, "categories.json"), "w", encoding="utf-8") as f:
    json.dump(categories, f, ensure_ascii=False, separators=(",", ":"))

# CSVs for a later database load (git-ignored folder; keeps Customer ID)
d[["invoice", "code", "qty", "date", "price", "customer", "country", "month", "is_return", "revenue", "category"]] \
    .to_csv(os.path.join(csvdir, "lines_clean.csv"), index=False)
products.to_csv(os.path.join(csvdir, "products.csv"), index=False)
mc.to_csv(os.path.join(csvdir, "month_country.csv"), index=False)
mcc.to_csv(os.path.join(csvdir, "month_country_category.csv"), index=False)
rfm.reset_index().to_csv(os.path.join(csvdir, "rfm_customers.csv"), index=False)
prod_rev = sales.groupby("code")["revenue"].sum()
unc = products[products["category"] == UNCATEGORIZED].assign(revenue=lambda x: x["code"].map(prod_rev).fillna(0).round(2))
unc.sort_values("revenue", ascending=False).to_csv(os.path.join(csvdir, "uncategorized.csv"), index=False)

# ---- Report -------------------------------------------------------------------------------------------------------
size_kb = os.path.getsize(snap_path) / 1024
cat_rev = sales.groupby("category")["revenue"].sum().reindex(CATEGORIES).fillna(0)
print("\nCLEANING REPORT")
print(f"raw lines {len(raw):,}")
for k, v in removed.items():
    print(f"  removed {k:<22} {v:>8,}")
print(f"clean lines {len(d):,} (sales {len(sales):,}, returns {len(returns):,})")
print(f"invoices with >1 country: {(multi['c'] > 1).sum()}, spanning >1 month: {(multi['m'] > 1).sum()} (first line wins)")
m = snapshot["meta"]
print(f"orders {m['orders']:,} (guest {guest_orders:,}), customers {m['customers']:,}, products {m['products']:,}")
print(f"revenue GBP {m['revenue']:,.2f}, units {m['units']:,}, returns GBP {m['returnsValue']:,.2f}")
print(f"date range {m['dateRange']}, countries {len(m['countries'])}, top 5 {top5}")
print("revenue by category:")
for c, v in cat_rev.items():
    print(f"  {c:<26} {v / cat_rev.sum():6.1%}  codes {int((products['category'] == c).sum()):>5}")
print("segments (all):", {r[1]: r[2] for r in seg_rows if r[0] == "all"})
print("table rows:", {k: len(v["rows"]) for k, v in snapshot.items() if isinstance(v, dict) and "rows" in v})
print(f"snapshot.json {size_kb:,.0f} KB")
if size_kb > 1536:
    sys.exit(f"snapshot.json is {size_kb:,.0f} KB, over the 1.5 MB budget")
