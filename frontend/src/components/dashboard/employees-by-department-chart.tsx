"use client";

import { DashboardChartCard } from "@/components/dashboard/dashboard-chart-card";
import type { DepartmentChartPoint } from "@/types/dashboard";
import { useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EmployeesByDepartmentChartProps {
  data: DepartmentChartPoint[];
}

export function EmployeesByDepartmentChart({ data }: EmployeesByDepartmentChartProps) {
  const t = useTranslations("dashboard");
  const chartData = data.filter((d) => d.count > 0);
  const isEmpty = chartData.length === 0;

  return (
    <DashboardChartCard
      title={t("employeesByDepartment")}
      description={t("employeesByDepartmentDescription")}
      isEmpty={isEmpty}
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardChartCard>
  );
}
