"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function GateMovesChart({ data }: { data: { date: string; moves: number }[] }) {
  return (
    <div className="rounded-xl border border-border-color bg-surface p-5 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="currentColor" />
          <YAxis tick={{ fontSize: 12 }} stroke="currentColor" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--border-color))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="moves" stroke="#0080FF" strokeWidth={2.5} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
