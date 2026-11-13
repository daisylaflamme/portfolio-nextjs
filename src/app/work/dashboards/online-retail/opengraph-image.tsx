import { ImageResponse } from "next/og";
import { onlineRetailSource } from "@/lib/dashboards/online-retail/data";
import { defaultFilters } from "@/lib/dashboards/online-retail/params";
import { count, moneyExact, moneyShort, percent } from "@/lib/dashboards/online-retail/format";

export const alt = "Online retail dashboard: revenue, orders, average order value, return rate and a monthly revenue chart, in dark theme";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dark theme tokens from globals.css.
const C = { bg: "#0a0e14", surface: "#111720", border: "#232a36", fg: "#e6eaf0", muted: "#9aa3b2", accent: "#5ee0a0" };

export default async function OpengraphImage() {
  const filters = defaultFilters(onlineRetailSource.meta);
  const [k, months] = await Promise.all([onlineRetailSource.kpis(filters), onlineRetailSource.monthlyRevenue(filters)]);
  const max = Math.max(...months.map((m) => m.revenue));
  const tiles = [
    ["Revenue", moneyShort(k.current.revenue)],
    ["Orders", count(k.current.orders)],
    ["Avg order", moneyExact(k.current.averageOrderValue)],
    ["Return rate", percent(k.current.returnRate)],
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.fg, padding: 64, gap: 28 }}>
        <div style={{ display: "flex", fontSize: 26, color: C.accent, fontFamily: "monospace" }}>{"// daisy laflamme · 1M+ invoice lines"}</div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, letterSpacing: -1.5 }}>Online retail dashboard</div>
        <div style={{ display: "flex", gap: 20 }}>
          {tiles.map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", flex: 1, background: C.surface, border: `2px solid ${C.border}`, borderRadius: 18, padding: "18px 22px" }}>
              <div style={{ display: "flex", fontSize: 22, color: C.muted }}>{label}</div>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flex: 1, background: C.surface, border: `2px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
          {months.map((m) => (
            <div key={m.month} style={{ display: "flex", flex: 1, height: `${(m.revenue / max) * 100}%`, background: C.accent, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
