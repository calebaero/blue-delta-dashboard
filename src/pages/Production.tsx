import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { KanbanBoard } from "@/components/production/KanbanBoard"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { PageLoadingState } from "@/components/shared/PageLoadingState"
import { useProductionStore } from "@/stores/useProductionStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useProductStore } from "@/stores/useProductStore"
import type { Order, OrderStatus, FabricFamily } from "@/data/types"

const STAGE_COLORS: Record<OrderStatus, string> = {
  "Order Received": "#64748b",
  "Pattern Drafting": "#3b82f6",
  Cutting: "#06b6d4",
  Sewing: "#6366f1",
  Finishing: "#8b5cf6",
  QC: "#f59e0b",
  Shipped: "#10b981",
}

const FABRIC_FAMILIES: FabricFamily[] = [
  "Raw Denim",
  "Cotton Chino",
  "Performance",
  "Cashiers Collection",
]

function getDaysInStage(order: Order): number {
  const currentStage = (order.pipelineStages ?? []).find(
    (s) => s.stage === order.status && !s.exitedAt
  )
  if (!currentStage) return 0
  const entered = new Date(currentStage.enteredAt)
  const now = new Date()
  return Math.floor(
    (now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
  )
}

function getDaysTotal(order: Order): number {
  const start = new Date(order.orderDate)
  const now = new Date()
  return Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}`
}

export default function ProductionPage() {
  const [view, setView] = useState<"board" | "list">("board")
  const [artisanFilter, setArtisanFilter] = useState("All")
  const [fabricFamilyFilter, setFabricFamilyFilter] = useState("All")
  const [metricsOpen, setMetricsOpen] = useState(false)

  const orders = useProductionStore((s) => s.orders)
  const getPipelineMetrics = useProductionStore((s) => s.getPipelineMetrics)
  const getArtisanWorkload = useProductionStore((s) => s.getArtisanWorkload)
  const getOrdersByStage = useProductionStore((s) => s.getOrdersByStage)
  const customers = useCustomerStore((s) => s.customers)
  const products = useProductStore((s) => s.products)

  const fetchProductionData = useProductionStore((s) => s.fetchData)
  const subscribeProduction = useProductionStore((s) => s.subscribeRealtime)
  const fetchCustomerData = useCustomerStore((s) => s.fetchData)
  const fetchProductData = useProductStore((s) => s.fetchData)
  const productionLoading = useProductionStore((s) => s.isLoading)
  const customerLoading = useCustomerStore((s) => s.isLoading)
  const productLoading = useProductStore((s) => s.isLoading)
  const productionError = useProductionStore((s) => s.error)
  const customerError = useCustomerStore((s) => s.error)
  const productError = useProductStore((s) => s.error)
  const isLoading = productionLoading || customerLoading || productLoading
  const error = productionError || customerError || productError

  useEffect(() => {
    fetchProductionData()
    fetchCustomerData()
    fetchProductData()
    return subscribeProduction()
  }, [])

  const metrics = getPipelineMetrics()
  const artisanWorkload = getArtisanWorkload()
  const stageGroups = getOrdersByStage()

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )

  // Artisan list for filter
  const artisanList = useMemo(() => {
    const set = new Set<string>()
    for (const o of orders) {
      if (o.assignedArtisan) set.add(o.assignedArtisan)
    }
    return Array.from(set).sort()
  }, [orders])

  // List view data: non-shipped orders sorted by days in stage desc
  const listOrders = useMemo(() => {
    return orders
      .filter((o) => o.status !== "Shipped")
      .map((o) => ({
        ...o,
        daysInStage: getDaysInStage(o),
        daysTotal: getDaysTotal(o),
        customerName: (() => {
          const c = customerMap.get(o.customerId)
          return c ? `${c.firstName} ${c.lastName}` : "Unknown"
        })(),
        productName: productMap.get(o.productId)?.name ?? "Unknown",
      }))
      .sort((a, b) => b.daysInStage - a.daysInStage)
  }, [orders, customerMap, productMap])

  type ListOrder = (typeof listOrders)[number]

  const listColumns: ColumnDef<ListOrder>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Order #
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link
            to={`/orders/${row.original.id}`}
            className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.customerName}</span>
        ),
      },
      {
        accessorKey: "productName",
        header: "Product",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.productName}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Stage",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} type="order" />
        ),
      },
      {
        accessorKey: "assignedArtisan",
        header: "Artisan",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.assignedArtisan ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "daysInStage",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Days in Stage
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const days = row.original.daysInStage
          const color =
            days > 5
              ? "text-red-600"
              : days >= 3
                ? "text-amber-600"
                : "text-emerald-600"
          return <span className={`text-sm font-medium ${color}`}>{days}d</span>
        },
      },
      {
        accessorKey: "daysTotal",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Days Total
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.daysTotal}d</span>
        ),
      },
      {
        accessorKey: "promisedDate",
        header: "Promised",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.promisedDate)}
          </span>
        ),
      },
    ],
    []
  )

  // Charts data
  const workloadChartData = artisanWorkload.slice(0, 10)
  const stageChartData = stageGroups.map((sg) => ({
    name: sg.stage,
    value: sg.count,
    color: STAGE_COLORS[sg.stage],
  }))

  return (
    <PageContainer title="Production Pipeline">
      <PageLoadingState isLoading={isLoading} error={error}>
      <div className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{metrics.totalActive}</p>
              <p className="text-xs text-muted-foreground">Active Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{metrics.artisansWorking}</p>
              <p className="text-xs text-muted-foreground">Artisans Working</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">
                {metrics.avgDaysInPipeline}d
              </p>
              <p className="text-xs text-muted-foreground">Avg Days in Pipeline</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">
                {metrics.ordersDueThisWeek}
              </p>
              <p className="text-xs text-muted-foreground">Due This Week</p>
            </CardContent>
          </Card>
        </div>

        {/* Metrics panel (collapsible) */}
        <Collapsible open={metricsOpen} onOpenChange={setMetricsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              {metricsOpen ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
              Metrics
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Artisan workload bar chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Artisan Workload (Top 10)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={workloadChartData}
                        layout="vertical"
                        margin={{ left: 80 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-border"
                        />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 10 }}
                          className="fill-muted-foreground"
                        />
                        <YAxis
                          type="category"
                          dataKey="artisan"
                          tick={{ fontSize: 10 }}
                          className="fill-muted-foreground"
                          width={75}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--card))",
                            color: "hsl(var(--card-foreground))",
                            fontSize: "12px",
                          }}
                        />
                        <Bar
                          dataKey="activeOrders"
                          fill="#4338ca"
                          radius={[0, 4, 4, 0]}
                          name="Active Orders"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Stage distribution pie chart */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Orders by Stage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stageChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          label={({ name, value }) =>
                            `${(name as string).split(" ").pop()} (${value})`
                          }
                          labelLine={{ strokeWidth: 1 }}
                        >
                          {stageChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid hsl(var(--border))",
                            backgroundColor: "hsl(var(--card))",
                            color: "hsl(var(--card-foreground))",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Controls row: view toggle + filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-md border">
            <Button
              variant={view === "board" ? "default" : "ghost"}
              size="sm"
              className={`gap-1 rounded-r-none ${
                view === "board"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : ""
              }`}
              onClick={() => setView("board")}
            >
              <LayoutGrid className="size-3.5" />
              Board
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              className={`gap-1 rounded-l-none ${
                view === "list"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : ""
              }`}
              onClick={() => setView("list")}
            >
              <List className="size-3.5" />
              List
            </Button>
          </div>

          <Select value={artisanFilter} onValueChange={setArtisanFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Artisans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Artisans</SelectItem>
              {artisanList.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={fabricFamilyFilter}
            onValueChange={setFabricFamilyFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Fabrics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Fabrics</SelectItem>
              {FABRIC_FAMILIES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Board / List view */}
        {view === "board" ? (
          <KanbanBoard
            artisanFilter={artisanFilter}
            fabricFamilyFilter={fabricFamilyFilter}
          />
        ) : (
          <DataTable
            columns={listColumns}
            data={listOrders}
            pageSize={25}
          />
        )}
      </div>
      </PageLoadingState>
    </PageContainer>
  )
}
