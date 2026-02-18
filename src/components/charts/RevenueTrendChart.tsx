import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RevenueDataPoint {
  month: string
  revenue: number
  orderCount: number
}

interface RevenueTrendChartProps {
  data: RevenueDataPoint[]
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value}`
}

function formatMonth(month: string): string {
  const [year, m] = month.split("-")
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${months[parseInt(m) - 1]} '${year.slice(2)}`
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Revenue Trend</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly revenue and order volume
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => String(v)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                  fontSize: "13px",
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  const v = value ?? 0
                  if (name === "revenue")
                    return [`$${v.toLocaleString()}`, "Revenue"]
                  return [v, "Orders"]
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="orderCount"
                fill="#4338ca"
                opacity={0.2}
                radius={[2, 2, 0, 0]}
                name="orderCount"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#4338ca"
                strokeWidth={2}
                dot={false}
                name="revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
