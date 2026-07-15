"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function RevenueTrendChart({ data }: { data: { date: string; amount: number }[] }) {
  return (
    <div className="rounded-xl border border-border-color bg-surface p-5 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00CDAB" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00CDAB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" />
          <YAxis tick={{ fontSize: 12 }} stroke="currentColor" />
          <Tooltip
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--border-color))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${Math.round(Number(value)).toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`, "Revenu"]}
          />
          <Area type="monotone" dataKey="amount" stroke="#00CDAB" strokeWidth={2.5} fill="url(#revenueFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
