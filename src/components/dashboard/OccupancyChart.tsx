"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BRAND_GRADIENT_STEPS } from "@/lib/utils";

export function OccupancyChart({ data }: { data: { type: string; count: number }[] }) {
  return (
    <div className="rounded-xl border border-border-color bg-surface p-5 h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="type" tick={{ fontSize: 12 }} stroke="currentColor" />
          <YAxis tick={{ fontSize: 12 }} stroke="currentColor" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "rgb(var(--surface))",
              border: "1px solid rgb(var(--border-color))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BRAND_GRADIENT_STEPS[i % BRAND_GRADIENT_STEPS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
