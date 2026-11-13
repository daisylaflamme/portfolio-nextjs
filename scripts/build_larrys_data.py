"""
Build anonymized, aggregated JSON for the Larry's Secret dashboard.
Input: LarrysSecretSalesData-Part1.xlsx (Part2 is an identical copy).
Output: larrys-secret.json. No customer names, numbers, birth data or raw rows.
Usage: python build_larrys_data.py <path-to-xlsx> <output.json>
"""
import sys, json
import pandas as pd

src, out = sys.argv[1], sys.argv[2]
raw = pd.read_excel(src, sheet_name=0, dtype={"Customer Zip Code": str, "Store Zip Code": str})
demo = pd.read_excel(src, sheet_name="MassachusettsDemographics", dtype={"ZipCode": str})

dupes = int(raw.duplicated().sum())
d = raw.drop_duplicates().copy()          # exact duplicate lines treated as data errors
d["date"] = d["Sales Date"].dt.strftime("%Y-%m-%d")
d["cost"] = d["Quantity"] * d["SKU Cost"]
d["loyal"] = d["Frequent Customer Number"].notna()

stores = (d[["Store Number", "StoreName", "City", "Store Zip Code"]].drop_duplicates()
          .rename(columns={"Store Number": "id", "StoreName": "name", "City": "city", "Store Zip Code": "zip"})
          .sort_values("id"))
skus = d.groupby(["SKU", "Description"]).agg(cost=("SKU Cost", "first"), listPrice=("Price", "max")).reset_index()
skus = skus.rename(columns={"SKU": "id", "Description": "name"}).sort_values("id")

# Grain 1: store x week x sku (all KPI and product charts filter client-side from this)
ssw = (d.groupby(["Store Number", "Fiscal Week", "SKU"])
       .agg(revenue=("Extended", "sum"), cost=("cost", "sum"), units=("Quantity", "sum"), lines=("Extended", "size"))
       .reset_index().rename(columns={"Store Number": "store", "Fiscal Week": "week", "SKU": "sku"}))

# Grain 2: store x day (daily trend, transactions)
txn = d.groupby("Transaction Number").agg(store=("Store Number", "first"), date=("date", "first"),
        week=("Fiscal Week", "first"), revenue=("Extended", "sum"), items=("Quantity", "sum"), loyal=("loyal", "max"))
daily = (txn.groupby(["store", "date", "week"])
         .agg(revenue=("revenue", "sum"), transactions=("revenue", "size"), items=("items", "sum"), loyaltyTransactions=("loyal", "sum"))
         .reset_index())

# Grain 3: price points (markdown analysis)
prices = (d.groupby(["Store Number", "SKU", "Price"]).agg(units=("Quantity", "sum"), revenue=("Extended", "sum"))
          .reset_index().rename(columns={"Store Number": "store", "SKU": "sku", "Price": "price"}))

# Grain 4: market basket pairs per store (count of transactions containing both SKUs)
pairs = []
for (store, t), g in d.groupby(["Store Number", "Transaction Number"]):
    s = sorted(set(g["SKU"]))
    for i in range(len(s)):
        for j in range(i + 1, len(s)):
            pairs.append((store, s[i], s[j]))
basket = (pd.DataFrame(pairs, columns=["store", "a", "b"]).groupby(["store", "a", "b"]).size()
          .reset_index(name="transactions"))
sku_txn = (d.groupby(["Store Number", "SKU"])["Transaction Number"].nunique().reset_index()
           .rename(columns={"Store Number": "store", "SKU": "sku", "Transaction Number": "transactions"}))

# Grain 5: loyalty customers, anonymized (for the discount what-if). Same metric as the first version of the dashboard:
# a customer's average line amount compared with the overall average line amount.
L = d[d["loyal"]]
overall_avg_line = float(d["Extended"].mean())
cust = L.groupby("Frequent Customer Number").agg(avgLine=("Extended", "mean"), spend=("Extended", "sum"),
        transactions=("Transaction Number", "nunique"), homeStore=("Store Number", lambda s: int(s.mode().iloc[0])),
        age=("Customer Age", "first")).reset_index(drop=True)
cust["ratio"] = (cust["avgLine"] / overall_avg_line).round(3)
cust["ageBand"] = pd.cut(cust["age"], [17, 24, 34, 44, 54, 120], labels=["18–24", "25–34", "35–44", "45–54", "55+"]).astype(str)
cust = cust.sample(frac=1, random_state=7).reset_index(drop=True)          # break any ordering link to source
cust.insert(0, "id", [f"C{i+1:03d}" for i in range(len(cust))])
cust = cust.drop(columns=["age"]).round({"avgLine": 2, "spend": 2})

# Grain 6: loyalty customers by home zip, joined to MA demographics (counts only; zips with <3 customers merged)
z = L.groupby("Customer Zip Code")["Frequent Customer Number"].nunique().reset_index(name="customers")
z = z.merge(demo, left_on="Customer Zip Code", right_on="ZipCode", how="left")
small = z[z["customers"] < 3]
z = z[z["customers"] >= 3]
zips = [{"zip": r.ZipCode, "place": r.PlaceName, "county": r.County, "lat": round(r.Latitude, 4), "lon": round(r.Longitude, 4),
         "customers": int(r.customers), "population": int(r.TotalPopulation), "medianAge": float(r.MedianAge),
         "avgIncome": int(r.AvgGrossIncome)} for r in z.itertuples() if pd.notna(r.ZipCode)]

def records(df): return json.loads(df.to_json(orient="records"))
data = {
    "meta": {
        "title": "Larry's Secret: retail sales, April 2012",
        "source": "Data: Larry’s Secret case-study sales data from the Business Intelligence class at UMass Boston. Aggregated and anonymized; 554 duplicate lines removed.",
        "dateRange": [d["date"].min(), d["date"].max()],
        "weeks": sorted(int(w) for w in d["Fiscal Week"].unique()),
        "rawLines": int(len(raw)), "duplicateLinesRemoved": dupes, "lines": int(len(d)),
        "transactions": int(d["Transaction Number"].nunique()),
        "loyaltyCustomers": int(len(cust)), "loyaltyCustomersInSmallZips": int(small["customers"].sum()),
        "overallAvgLine": round(overall_avg_line, 2),
        "discountTiers2013": {"workbook1": [1, 2, 3], "workbook2": [1, 1.6, 2.2], "labels": ["10%", "20%", "40%"]},
    },
    "stores": records(stores), "skus": records(skus),
    "storeWeekSku": records(ssw.round(2)), "daily": records(daily.round(2)), "pricePoints": records(prices.round(2)),
    "basketPairs": records(basket), "skuTransactions": records(sku_txn),
    "loyaltyCustomers": records(cust), "loyaltyZips": zips,
}
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
print("ok", {k: (len(v) if isinstance(v, list) else "") for k, v in data.items()})
