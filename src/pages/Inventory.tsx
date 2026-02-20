import { useEffect, useMemo } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts"
import { ArrowUpDown, AlertTriangle } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PageLoadingState } from "@/components/shared/PageLoadingState"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { useAnalyticsStore } from "@/stores/useAnalyticsStore"
import type { FabricRoll, HardwareItem, RollStatus } from "@/data/types"

const ROLL_STATUS_COLORS: Record<RollStatus, string> = {
  Active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Low: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Depleted: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Quarantine:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

const HW_STATUS_COLORS: Record<string, string> = {
  "In Stock":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Low: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Out of Stock":
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export default function InventoryPage() {
  const fabricRolls = useInventoryStore((s) => s.fabricRolls)
  const hardware = useInventoryStore((s) => s.hardware)
  const getInventoryAlerts = useInventoryStore((s) => s.getInventoryAlerts)
  const monthlyMetrics = useAnalyticsStore((s) => s.monthlyMetrics)

  const fetchInventoryData = useInventoryStore((s) => s.fetchData)
  const subscribeInventory = useInventoryStore((s) => s.subscribeRealtime)
  const fetchAnalyticsData = useAnalyticsStore((s) => s.fetchData)
  const inventoryLoading = useInventoryStore((s) => s.isLoading)
  const analyticsLoading = useAnalyticsStore((s) => s.isLoading)
  const inventoryError = useInventoryStore((s) => s.error)
  const analyticsError = useAnalyticsStore((s) => s.error)
  const isLoading = inventoryLoading || analyticsLoading
  const error = inventoryError || analyticsError

  useEffect(() => {
    fetchInventoryData()
    fetchAnalyticsData()
    return subscribeInventory()
  }, [])

  const alerts = getInventoryAlerts()

  // Fabric stats
  const fabricStats = useMemo(() => {
    const activeRolls = fabricRolls.filter((r) => r.status === "Active")
    const totalYards = fabricRolls.reduce((sum, r) => sum + r.currentYards, 0)
    const lowRolls = fabricRolls.filter(
      (r) => r.status === "Low" || r.status === "Depleted"
    )
    const quarantined = fabricRolls.filter((r) => r.status === "Quarantine")
    return {
      activeRolls: activeRolls.length,
      totalYards: totalYards.toFixed(0),
      lowRolls: lowRolls.length,
      quarantined: quarantined.length,
    }
  }, [fabricRolls])

  // Roll levels chart data
  const rollChartData = useMemo(() => {
    return fabricRolls.map((r) => {
      const pct = (r.currentYards / r.initialYards) * 100
      const reorderPct = (r.reorderPointYards / r.initialYards) * 100
      return {
        name: `${r.color} ${r.fabricFamily}`,
        pct: parseFloat(pct.toFixed(1)),
        reorderPct: parseFloat(reorderPct.toFixed(1)),
        status: r.status,
        current: r.currentYards,
        initial: r.initialYards,
      }
    })
  }, [fabricRolls])

  // Consumption vs receiving chart (from monthly metrics)
  const consumptionData = useMemo(() => {
    return monthlyMetrics.slice(-12).map((m) => {
      const [, month] = m.month.split("-")
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ]
      return {
        label: months[parseInt(month) - 1],
        consumed: m.fabricYardsConsumed,
        received: m.fabricYardsReceived,
      }
    })
  }, [monthlyMetrics])

  // Fabric roll columns
  const rollColumns: ColumnDef<FabricRoll>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Roll ID",
        cell: ({ row }) => (
          <Link
            to={`/inventory/rolls/${row.original.id}`}
            className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "materialName",
        header: "Material",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.materialName}</span>
        ),
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.color}</span>
        ),
      },
      {
        accessorKey: "fabricFamily",
        header: "Family",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.fabricFamily}
          </span>
        ),
      },
      {
        accessorKey: "widthInches",
        header: "Width",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.widthInches}&Prime;</span>
        ),
      },
      {
        accessorKey: "currentYards",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Current Yds
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.currentYards}
          </span>
        ),
      },
      {
        accessorKey: "initialYards",
        header: "Initial Yds",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.initialYards}
          </span>
        ),
      },
      {
        accessorKey: "utilization",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Util %
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        accessorFn: (row) =>
          parseFloat(
            (
              ((row.initialYards - row.currentYards) / row.initialYards) *
              100
            ).toFixed(1)
          ),
        cell: ({ row }) => {
          const util =
            ((row.original.initialYards - row.original.currentYards) /
              row.original.initialYards) *
            100
          return <span className="text-sm">{util.toFixed(1)}%</span>
        },
      },
      {
        accessorKey: "shrinkage",
        header: "Shrinkage",
        accessorFn: (row) =>
          `${row.shrinkageWarpPct}/${row.shrinkageWeftPct}`,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            W:{row.original.shrinkageWarpPct}% / Wf:
            {row.original.shrinkageWeftPct}%
          </span>
        ),
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.supplier}
          </span>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.location}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={`text-xs ${ROLL_STATUS_COLORS[row.original.status]}`}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "receivedDate",
        header: "Received",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {formatDate(row.original.receivedDate)}
          </span>
        ),
      },
    ],
    []
  )

  // Hardware columns
  const hwColumns: ColumnDef<HardwareItem>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "variant",
        header: "Variant",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.variant}
          </span>
        ),
      },
      {
        accessorKey: "currentStock",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Stock
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.currentStock}
          </span>
        ),
      },
      {
        accessorKey: "reorderPoint",
        header: "Reorder Pt",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.reorderPoint}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant="secondary"
            className={`text-xs ${HW_STATUS_COLORS[row.original.status] || ""}`}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "bomQuantityPerJean",
        header: "BOM Qty/Jean",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.bomQuantityPerJean}</span>
        ),
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.supplier}
          </span>
        ),
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.location}
          </span>
        ),
      },
    ],
    []
  )

  // Alerts grouped by severity
  const criticalAlerts = alerts.filter((a) => a.severity === "critical")
  const warningAlerts = alerts.filter((a) => a.severity === "warning")

  return (
    <PageContainer title="Inventory">
      <PageLoadingState isLoading={isLoading} error={error}>
      <Tabs defaultValue="fabric">
        <TabsList>
          <TabsTrigger value="fabric">Fabric Rolls</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.length > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 size-5 justify-center rounded-full p-0 text-[10px]"
              >
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Fabric Rolls Tab */}
        <TabsContent value="fabric" className="mt-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Card>
              <CardContent className="px-3 py-2.5 text-center">
                <p className="text-lg font-semibold">
                  {fabricStats.activeRolls}
                </p>
                <p className="text-xs text-muted-foreground">Active Rolls</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-3 py-2.5 text-center">
                <p className="text-lg font-semibold">
                  {fabricStats.totalYards}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Yards Available
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-3 py-2.5 text-center">
                <p className="text-lg font-semibold">
                  {fabricStats.lowRolls > 0 ? (
                    <span className="text-red-600">{fabricStats.lowRolls}</span>
                  ) : (
                    fabricStats.lowRolls
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Below Reorder Point
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-3 py-2.5 text-center">
                <p className="text-lg font-semibold">
                  {fabricStats.quarantined}
                </p>
                <p className="text-xs text-muted-foreground">Quarantined</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Roll levels bar chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Roll Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rollChartData} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 9 }}
                        className="fill-muted-foreground"
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          color: "hsl(var(--card-foreground))",
                          fontSize: "12px",
                        }}
                        formatter={(value: number | undefined, _name: string | undefined) => [`${value ?? 0}%`, "Level"]}
                      />
                      <ReferenceLine
                        x={30}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{
                          value: "Reorder",
                          fontSize: 9,
                          fill: "#ef4444",
                        }}
                      />
                      <Bar dataKey="pct" radius={[0, 4, 4, 0]} name="Level">
                        {rollChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              entry.status === "Quarantine"
                                ? "#94a3b8"
                                : entry.pct < 25
                                  ? "#ef4444"
                                  : entry.pct < 50
                                    ? "#f59e0b"
                                    : "#10b981"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Consumption vs Receiving area chart */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Consumption vs Receiving (12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={consumptionData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          backgroundColor: "hsl(var(--card))",
                          color: "hsl(var(--card-foreground))",
                          fontSize: "12px",
                        }}
                        formatter={(value: number | undefined, name: string | undefined) => [
                          `${value ?? 0} yds`,
                          name === "consumed" ? "Consumed" : "Received",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="received"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="received"
                      />
                      <Area
                        type="monotone"
                        dataKey="consumed"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.3}
                        name="consumed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fabric table */}
          <DataTable columns={rollColumns} data={fabricRolls} pageSize={15} />
        </TabsContent>

        {/* Hardware Tab */}
        <TabsContent value="hardware" className="mt-4">
          <DataTable columns={hwColumns} data={hardware} pageSize={15} />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4 space-y-4">
          {criticalAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-red-600">
                Critical ({criticalAlerts.length})
              </h3>
              {criticalAlerts.map((a) => (
                <Alert key={a.id} variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertTitle className="text-sm">{a.name}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {a.currentLevel.toFixed(1)} {a.unit} remaining (reorder
                    point: {a.reorderPoint} {a.unit})
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
          {warningAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-amber-600">
                Warning ({warningAlerts.length})
              </h3>
              {warningAlerts.map((a) => (
                <Alert key={a.id}>
                  <AlertTriangle className="size-4 text-amber-500" />
                  <AlertTitle className="text-sm">{a.name}</AlertTitle>
                  <AlertDescription className="text-xs">
                    {a.currentLevel.toFixed(1)} {a.unit} remaining (reorder
                    point: {a.reorderPoint} {a.unit})
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
          {alerts.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                All inventory levels are healthy.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      </PageLoadingState>
    </PageContainer>
  )
}
