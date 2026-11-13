import { ImageResponse } from "next/og";
import { larrysData } from "@/lib/dashboards/larrys/data";
import { selectDailyRevenue, selectKpis } from "@/lib/dashboards/larrys/selectors";
import { count, moneyShort, percent } from "@/lib/dashboards/larrys/format";

export const alt = "Retail sales dashboard: revenue, gross margin, transactions and a daily revenue line, in dark theme";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Dark theme tokens from globals.css.
const C = { bg: "#0a0e14", surface: "#111720", border: "#232a36", fg: "#e6eaf0", muted: "#9aa3b2", accent: "#5ee0a0" };

export default function OpengraphImage() {
  const k = selectKpis(larrysData, { store: "all" });
  const days = selectDailyRevenue(larrysData, { store: "all" });
  const max = Math.max(...days.map((d) => d.revenue));
  const tiles = [
    ["Revenue", moneyShort(k.revenue)],
    ["Gross margin", percent(k.grossMargin)],
    ["Transactions", count(k.transactions)],
    ["Average basket", `$${Math.round(k.avgBasket)}`],
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: C.bg, color: C.fg, padding: 64, gap: 28 }}>
        <div style={{ display: "flex", fontSize: 26, color: C.accent, fontFamily: "monospace" }}>{"// daisy laflamme · live dashboard"}</div>
        <div style={{ display: "flex", fontSize: 68, fontWeight: 700, letterSpacing: -1.5 }}>Retail sales dashboard</div>
        <div style={{ display: "flex", gap: 20 }}>
          {tiles.map(([label, value]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", flex: 1, background: C.surface, border: `2px solid ${C.border}`, borderRadius: 18, padding: "18px 22px" }}>
              <div style={{ display: "flex", fontSize: 22, color: C.muted }}>{label}</div>
              <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, flex: 1, background: C.surface, border: `2px solid ${C.border}`, borderRadius: 18, padding: 20 }}>
          {days.map((d) => (
            <div key={d.date} style={{ display: "flex", flex: 1, height: `${(d.revenue / max) * 100}%`, background: C.accent, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
