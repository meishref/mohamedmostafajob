"use client";

import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import type { MonthlyChartPoint } from "@/types/dashboard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyBarChartProps {
  title: string;
  description?: string;
  data: MonthlyChartPoint[];
  color?: string;
}

export function MonthlyBarChart({
  title,
  description,
  data,
  color = "hsl(var(--primary))",
}: MonthlyBarChartProps) {
  const isEmpty = data.every((d) => d.total === 0);

  return (
    <DashboardChartCard title={title} description={description} isEmpty={isEmpty}>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value: number) => [value.toLocaleString(), "Total"]}
            />
            <Bar dataKey="total" fill={color} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardChartCard>
  );
}
