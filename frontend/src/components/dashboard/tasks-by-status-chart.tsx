"use client";

import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import type { TaskStatusChartPoint } from "@/types/dashboard";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TasksByStatusChartProps {
  data: TaskStatusChartPoint[];
}

export function TasksByStatusChart({ data }: TasksByStatusChartProps) {
  const t = useTranslations("dashboard");
  const chartData = data.filter((d) => d.count > 0);
  const isEmpty = chartData.length === 0;

  return (
    <DashboardChartCard
      title={t("tasksByStatus")}
      description={t("tasksByStatusDescription")}
      isEmpty={isEmpty}
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.id} fill={entry.color ?? "hsl(var(--primary))"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardChartCard>
  );
}
