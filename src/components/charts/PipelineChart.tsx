import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OrderStatus } from "@/data/types"

interface StageData {
  stage: OrderStatus
  count: number
  avgDaysInStage: number
}

interface PipelineChartProps {
  data: StageData[]
}

const STAGE_COLORS: Record<OrderStatus, string> = {
  "Order Received": "#94a3b8",
  "Pattern Drafting": "#3b82f6",
  Cutting: "#06b6d4",
  Sewing: "#4f46e5",
  Finishing: "#8b5cf6",
  QC: "#f59e0b",
  Shipped: "#10b981",
}

export function PipelineChart({ data }: PipelineChartProps) {
  // Build a single bar chart row with stacked segments
  const total = data.reduce((sum, d) => sum + d.count, 0)
  const chartData = [
    data.reduce(
      (acc, d) => {
        acc[d.stage] = d.count
        return acc
      },
      { name: "pipeline" } as Record<string, number | string>
    ),
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Production Pipeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {total} total orders across all stages
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-14">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              barSize={32}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" hide dataKey="name" />
              <Tooltip
                formatter={(value: number | undefined, name: string | undefined) => [
                  `${value ?? 0} orders`,
                  name ?? "",
                ]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              {data.map((d) => (
                <Bar
                  key={d.stage}
                  dataKey={d.stage}
                  stackId="pipeline"
                  fill={STAGE_COLORS[d.stage]}
                  radius={
                    d.stage === "Order Received"
                      ? [4, 0, 0, 4]
                      : d.stage === "Shipped"
                        ? [0, 4, 4, 0]
                        : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3">
          {data.map((d) => (
            <div key={d.stage} className="flex items-center gap-1.5">
              <div
                className="size-2.5 rounded-full"
                style={{ backgroundColor: STAGE_COLORS[d.stage] }}
              />
              <span className="text-xs text-muted-foreground">
                {d.stage} ({d.count})
              </span>
            </div>
          ))}
        </div>

        {/* Stage table */}
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-xs">Stage</TableHead>
                <TableHead className="h-8 text-right text-xs">
                  Orders
                </TableHead>
                <TableHead className="h-8 text-right text-xs">
                  Avg Days
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((d) => (
                <TableRow key={d.stage}>
                  <TableCell className="py-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: STAGE_COLORS[d.stage] }}
                      />
                      <span className="text-sm">{d.stage}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 text-right text-sm">
                    {d.count}
                  </TableCell>
                  <TableCell className="py-1.5 text-right text-sm">
                    {d.avgDaysInStage}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
