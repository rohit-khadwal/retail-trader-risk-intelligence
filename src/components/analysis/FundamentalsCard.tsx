"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FundamentalsProps {
  // Valuation
  peRatio: number | null;
  forwardPE: number | null;
  enterpriseValue: number | null;
  priceToBook: number | null;
  // Earnings
  eps: number | null;
  forwardEps: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  netIncome: number | null;
  isProfit: boolean;
  // Margins
  profitMargin: number | null;
  operatingMargin: number | null;
  grossMargin: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  // Health
  debtToEquity: number | null;
  freeCashFlow: number | null;
  currentRatio: number | null;
  // Market
  beta: number | null;
  dividendYield: number | null;
  week52High: number | null;
  week52Low: number | null;
  // Ownership
  institutionalOwnership: number | null;
  insiderOwnership: number | null;
  // Quarterly earnings (last 4)
  quarterlyEarnings: { date: string; actual: number | null; estimate: number | null }[];
}

// ─── Formatters ──────────────────────────────────────────────────────────────

function fmt(n: number | null, prefix = "", suffix = "", decimals = 2): string {
  if (n === null || n === undefined) return "N/A";
  return `${prefix}${n.toFixed(decimals)}${suffix}`;
}

function fmtBig(n: number | null, withDollar = true): string {
  if (n === null || n === undefined) return "N/A";
  const prefix = withDollar ? "$" : "";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${prefix}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${sign}${prefix}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${sign}${prefix}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3)  return `${sign}${prefix}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${prefix}${abs.toFixed(2)}`;
}

function fmtPct(n: number | null): string {
  if (n === null || n === undefined) return "N/A";
  return `${(n * 100).toFixed(2)}%`;
}

// ─── Shared sub-components ───────────────────────────────────────────────────

interface RowProps {
  label: string;
  value: React.ReactNode;
  last?: boolean;
}

function Row({ label, value, last = false }: RowProps) {
  return (
    <div className={cn("flex items-center justify-between py-2.5 gap-4", !last && "border-b border-white/5")}>
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-semibold text-right font-mono">{value}</span>
    </div>
  );
}

function pctNode(n: number | null, positiveIsGood = true): React.ReactNode {
  if (n === null) return <span className="text-muted-foreground">N/A</span>;
  const val = n * 100;
  const color = positiveIsGood
    ? val > 0 ? "text-emerald-400" : val < 0 ? "text-red-400" : "text-yellow-400"
    : val < 0 ? "text-emerald-400" : val > 0 ? "text-red-400" : "text-yellow-400";
  return <span className={color}>{val.toFixed(2)}%</span>;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = "Valuation" | "Profitability" | "Financial Health" | "Ownership";
const TABS: TabId[] = ["Valuation", "Profitability", "Financial Health", "Ownership"];

// ─── Valuation tab ────────────────────────────────────────────────────────────

function ValuationTab({
  peRatio, forwardPE, enterpriseValue, priceToBook,
  eps, forwardEps, revenue, revenueGrowth, isProfit,
  quarterlyEarnings,
}: Pick<FundamentalsProps,
  | "peRatio" | "forwardPE" | "enterpriseValue" | "priceToBook"
  | "eps" | "forwardEps" | "revenue" | "revenueGrowth" | "isProfit"
  | "quarterlyEarnings"
>) {
  const peNode = peRatio !== null
    ? <span className="font-mono">{peRatio.toFixed(2)}</span>
    : !isProfit
      ? <span className="text-red-400">Loss</span>
      : <span className="text-muted-foreground">N/A</span>;

  const rows: RowProps[] = [
    { label: "P/E Ratio (TTM)", value: peNode },
    { label: "Forward P/E",     value: forwardPE !== null ? <span className="font-mono">{forwardPE.toFixed(2)}</span> : <span className="text-muted-foreground">N/A</span> },
    { label: "Enterprise Value", value: <span className="font-mono">{fmtBig(enterpriseValue)}</span> },
    { label: "Price / Book",    value: <span className="font-mono">{fmt(priceToBook)}</span> },
    { label: "EPS (TTM)",       value: <span className={cn("font-mono", eps !== null && eps < 0 ? "text-red-400" : "text-emerald-400")}>{fmt(eps, "$")}</span> },
    { label: "Forward EPS",     value: <span className={cn("font-mono", forwardEps !== null && forwardEps < 0 ? "text-red-400" : "text-emerald-400")}>{fmt(forwardEps, "$")}</span> },
    { label: "Revenue (TTM)",   value: <span className="font-mono">{fmtBig(revenue)}</span> },
    {
      label: "Revenue Growth",
      value: revenueGrowth !== null
        ? <span className={cn("font-mono", revenueGrowth >= 0 ? "text-emerald-400" : "text-red-400")}>{(revenueGrowth * 100).toFixed(2)}%</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
  ];

  return (
    <div>
      <div>
        {rows.map((r, i) => <Row key={r.label} {...r} last={i === rows.length - 1 && quarterlyEarnings.length === 0} />)}
      </div>

      {/* Quarterly earnings mini-table */}
      {quarterlyEarnings.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Quarterly Earnings (EPS)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-white/5">
                  <th className="text-left py-1.5 pr-3 font-medium">Quarter</th>
                  <th className="text-right py-1.5 pr-3 font-medium">Estimate</th>
                  <th className="text-right py-1.5 pr-3 font-medium">Actual</th>
                  <th className="text-right py-1.5 font-medium">Result</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyEarnings.slice(-4).map((q, i) => {
                  const beat =
                    q.actual !== null && q.estimate !== null
                      ? q.actual >= q.estimate
                      : null;
                  return (
                    <tr key={i} className={cn("border-b border-white/5", i === quarterlyEarnings.slice(-4).length - 1 && "border-0")}>
                      <td className="py-1.5 pr-3 text-muted-foreground">{q.date}</td>
                      <td className="py-1.5 pr-3 text-right font-mono">
                        {q.estimate !== null ? `$${q.estimate.toFixed(2)}` : "—"}
                      </td>
                      <td className={cn("py-1.5 pr-3 text-right font-mono", q.actual !== null && q.actual < 0 ? "text-red-400" : "text-emerald-400")}>
                        {q.actual !== null ? `$${q.actual.toFixed(2)}` : "—"}
                      </td>
                      <td className="py-1.5 text-right">
                        {beat === null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : beat ? (
                          <span className="inline-block px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold">Beat</span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400 font-semibold">Miss</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profitability tab ────────────────────────────────────────────────────────

function ProfitabilityTab({
  profitMargin, operatingMargin, grossMargin,
  returnOnEquity, returnOnAssets,
  netIncome, freeCashFlow, isProfit,
}: Pick<FundamentalsProps,
  | "profitMargin" | "operatingMargin" | "grossMargin"
  | "returnOnEquity" | "returnOnAssets"
  | "netIncome" | "freeCashFlow" | "isProfit"
>) {
  const rows: RowProps[] = [
    { label: "Profit Margin",     value: pctNode(profitMargin) },
    { label: "Operating Margin",  value: pctNode(operatingMargin) },
    { label: "Gross Margin",      value: pctNode(grossMargin) },
    { label: "Return on Equity",  value: pctNode(returnOnEquity) },
    { label: "Return on Assets",  value: pctNode(returnOnAssets) },
    {
      label: "Net Income",
      value: netIncome !== null
        ? <span className={cn("font-mono", netIncome >= 0 ? "text-emerald-400" : "text-red-400")}>{fmtBig(netIncome)}</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
    {
      label: "Free Cash Flow",
      value: freeCashFlow !== null
        ? <span className={cn("font-mono", freeCashFlow >= 0 ? "text-emerald-400" : "text-red-400")}>{fmtBig(freeCashFlow)}</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
    {
      label: "Profitable?",
      value: isProfit
        ? <span className="text-emerald-400 font-semibold">Yes</span>
        : <span className="text-red-400 font-semibold">No</span>,
    },
  ];

  return (
    <div>
      {rows.map((r, i) => <Row key={r.label} {...r} last={i === rows.length - 1} />)}
    </div>
  );
}

// ─── Financial Health tab ─────────────────────────────────────────────────────

function FinancialHealthTab({
  debtToEquity, currentRatio, freeCashFlow,
  beta, dividendYield, week52High, week52Low,
}: Pick<FundamentalsProps,
  | "debtToEquity" | "currentRatio" | "freeCashFlow"
  | "beta" | "dividendYield" | "week52High" | "week52Low"
>) {
  const deNode = debtToEquity !== null
    ? <span className={cn("font-mono", debtToEquity < 1 ? "text-emerald-400" : debtToEquity <= 2 ? "text-yellow-400" : "text-red-400")}>{debtToEquity.toFixed(2)}</span>
    : <span className="text-muted-foreground">N/A</span>;

  const crNode = currentRatio !== null
    ? <span className={cn("font-mono", currentRatio > 2 ? "text-emerald-400" : currentRatio >= 1 ? "text-yellow-400" : "text-red-400")}>{currentRatio.toFixed(2)}</span>
    : <span className="text-muted-foreground">N/A</span>;

  const betaColor =
    beta === null ? "text-muted-foreground" :
    beta < 1      ? "text-emerald-400" :
    beta <= 1.5   ? "text-yellow-400" :
    "text-red-400";

  const rows: RowProps[] = [
    { label: "Debt / Equity",    value: deNode },
    { label: "Current Ratio",    value: crNode },
    {
      label: "Free Cash Flow",
      value: freeCashFlow !== null
        ? <span className={cn("font-mono", freeCashFlow >= 0 ? "text-emerald-400" : "text-red-400")}>{fmtBig(freeCashFlow)}</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
    { label: "Beta",             value: <span className={cn("font-mono", betaColor)}>{fmt(beta)}</span> },
    {
      label: "Dividend Yield",
      value: dividendYield && dividendYield > 0
        ? <span className="text-emerald-400 font-mono">{(dividendYield * 100).toFixed(2)}%</span>
        : <span className="text-muted-foreground">None</span>,
    },
    { label: "52-Week High",     value: <span className="font-mono text-emerald-400">{week52High !== null ? `$${week52High.toFixed(2)}` : "N/A"}</span> },
    { label: "52-Week Low",      value: <span className="font-mono text-red-400">{week52Low !== null ? `$${week52Low.toFixed(2)}` : "N/A"}</span> },
  ];

  return (
    <div>
      {rows.map((r, i) => <Row key={r.label} {...r} last={i === rows.length - 1} />)}
    </div>
  );
}

// ─── Ownership tab ────────────────────────────────────────────────────────────

function OwnershipTab({
  institutionalOwnership,
  insiderOwnership,
}: Pick<FundamentalsProps, "institutionalOwnership" | "insiderOwnership">) {
  const instPct  = institutionalOwnership !== null ? Math.min(institutionalOwnership * 100, 100) : null;
  const insPct   = insiderOwnership !== null       ? Math.min(insiderOwnership * 100, 100)       : null;
  const otherPct =
    instPct !== null && insPct !== null
      ? Math.max(0, 100 - instPct - insPct)
      : null;

  const rows: RowProps[] = [
    {
      label: "Institutional Ownership",
      value: institutionalOwnership !== null
        ? <span className="font-mono text-primary">{(institutionalOwnership * 100).toFixed(2)}%</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
    {
      label: "Insider Ownership",
      value: insiderOwnership !== null
        ? <span className="font-mono text-yellow-400">{(insiderOwnership * 100).toFixed(2)}%</span>
        : <span className="text-muted-foreground">N/A</span>,
    },
  ];

  return (
    <div>
      {rows.map((r, i) => <Row key={r.label} {...r} last={i === rows.length - 1 && (instPct === null || insPct === null)} />)}

      {/* Ownership split bar */}
      {instPct !== null && insPct !== null && otherPct !== null && (
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-2">Ownership Breakdown</div>
          <div className="h-5 rounded-full overflow-hidden flex">
            {instPct > 0 && (
              <div
                className="h-full bg-blue-500 flex items-center justify-center text-[10px] font-semibold text-white overflow-hidden"
                style={{ width: `${instPct}%` }}
                title={`Institutional: ${instPct.toFixed(1)}%`}
              >
                {instPct >= 8 ? `${instPct.toFixed(0)}%` : ""}
              </div>
            )}
            {insPct > 0 && (
              <div
                className="h-full bg-yellow-400 flex items-center justify-center text-[10px] font-semibold text-black overflow-hidden"
                style={{ width: `${insPct}%` }}
                title={`Insider: ${insPct.toFixed(1)}%`}
              >
                {insPct >= 8 ? `${insPct.toFixed(0)}%` : ""}
              </div>
            )}
            {otherPct > 0 && (
              <div
                className="h-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-muted-foreground overflow-hidden"
                style={{ width: `${otherPct}%` }}
                title={`Other: ${otherPct.toFixed(1)}%`}
              >
                {otherPct >= 8 ? `${otherPct.toFixed(0)}%` : ""}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-2 text-[11px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-blue-500" />
              Institutional
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-yellow-400" />
              Insider
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-sm bg-white/20" />
              Other / Retail
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FundamentalsCard(props: FundamentalsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("Valuation");

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">Fundamentals</h3>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 mb-4 p-1 bg-white/5 rounded-xl flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 min-w-fit text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-150 whitespace-nowrap",
              activeTab === tab
                ? "bg-white/10 text-white shadow"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "Valuation" && (
          <ValuationTab
            peRatio={props.peRatio}
            forwardPE={props.forwardPE}
            enterpriseValue={props.enterpriseValue}
            priceToBook={props.priceToBook}
            eps={props.eps}
            forwardEps={props.forwardEps}
            revenue={props.revenue}
            revenueGrowth={props.revenueGrowth}
            isProfit={props.isProfit}
            quarterlyEarnings={props.quarterlyEarnings}
          />
        )}
        {activeTab === "Profitability" && (
          <ProfitabilityTab
            profitMargin={props.profitMargin}
            operatingMargin={props.operatingMargin}
            grossMargin={props.grossMargin}
            returnOnEquity={props.returnOnEquity}
            returnOnAssets={props.returnOnAssets}
            netIncome={props.netIncome}
            freeCashFlow={props.freeCashFlow}
            isProfit={props.isProfit}
          />
        )}
        {activeTab === "Financial Health" && (
          <FinancialHealthTab
            debtToEquity={props.debtToEquity}
            currentRatio={props.currentRatio}
            freeCashFlow={props.freeCashFlow}
            beta={props.beta}
            dividendYield={props.dividendYield}
            week52High={props.week52High}
            week52Low={props.week52Low}
          />
        )}
        {activeTab === "Ownership" && (
          <OwnershipTab
            institutionalOwnership={props.institutionalOwnership}
            insiderOwnership={props.insiderOwnership}
          />
        )}
      </div>
    </div>
  );
}
