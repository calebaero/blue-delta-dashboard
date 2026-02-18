import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

interface KpiCardProps {
  label: string
  value: string
  trend: number // percentage change, positive = up
  trendLabel?: string
  sparklineData?: { value: number }[]
  icon?: LucideIcon
}

export function KpiCard({
  label,
  value,
  trend,
  trendLabel = "vs last month",
  sparklineData,
}: KpiCardProps) {
  const isPositive = trend >= 0

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {value}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {isPositive ? (
                <ArrowUpRight className="size-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="size-4 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${isPositive ? "text-emerald-500" : "text-red-500"}`}
              >
                {isPositive ? "+" : ""}
                {trend.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                {trendLabel}
              </span>
            </div>
          </div>
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-12 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient
                      id="sparklineFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={isPositive ? "#10b981" : "#ef4444"}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor={isPositive ? "#10b981" : "#ef4444"}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? "#10b981" : "#ef4444"}
                    strokeWidth={1.5}
                    fill="url(#sparklineFill)"
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
