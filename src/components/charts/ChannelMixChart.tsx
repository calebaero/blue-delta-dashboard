import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ChannelDataPoint {
  month: string
  dtcWeb: number
  dtcStore: number
  b2b: number
  trunkShow: number
}

interface ChannelMixChartProps {
  data: ChannelDataPoint[]
}

const CHANNEL_COLORS = {
  dtcWeb: "#3b82f6",
  dtcStore: "#14b8a6",
  b2b: "#f97316",
  trunkShow: "#fbbf24",
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

export function ChannelMixChart({ data }: ChannelMixChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }))

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Channel Mix Over Time
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Order volume by acquisition channel (last 18 months)
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                  fontSize: "13px",
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    dtcWeb: "DTC Web",
                    dtcStore: "DTC Store",
                    b2b: "B2B (All)",
                    trunkShow: "Trunk Show",
                  }
                  return [value, labels[name] || name]
                }}
              />
              <Area
                type="monotone"
                dataKey="dtcWeb"
                stackId="1"
                stroke={CHANNEL_COLORS.dtcWeb}
                fill={CHANNEL_COLORS.dtcWeb}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="dtcStore"
                stackId="1"
                stroke={CHANNEL_COLORS.dtcStore}
                fill={CHANNEL_COLORS.dtcStore}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="b2b"
                stackId="1"
                stroke={CHANNEL_COLORS.b2b}
                fill={CHANNEL_COLORS.b2b}
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="trunkShow"
                stackId="1"
                stroke={CHANNEL_COLORS.trunkShow}
                fill={CHANNEL_COLORS.trunkShow}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-4">
          {[
            { key: "dtcWeb", label: "DTC Web", color: CHANNEL_COLORS.dtcWeb },
            {
              key: "dtcStore",
              label: "DTC Store",
              color: CHANNEL_COLORS.dtcStore,
            },
            { key: "b2b", label: "B2B (All)", color: CHANNEL_COLORS.b2b },
            {
              key: "trunkShow",
              label: "Trunk Show",
              color: CHANNEL_COLORS.trunkShow,
            },
          ].map((ch) => (
            <div key={ch.key} className="flex items-center gap-1.5">
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: ch.color }}
              />
              <span className="text-xs text-muted-foreground">{ch.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
