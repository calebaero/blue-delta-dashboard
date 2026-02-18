import { useState, useMemo } from "react"
import { useParams, Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { ArrowLeft, ArrowUpDown } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { usePartnerStore } from "@/stores/usePartnerStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { initializeMockData } from "@/data/mockData"
import type { Order, PartnerRep } from "@/data/types"

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

interface OrderRow extends Order {
  customerName: string
  repName: string
}

export default function PartnerDetailPage() {
  const { id } = useParams()
  const getPartnerById = usePartnerStore((s) => s.getPartnerById)
  const getRepsByPartner = usePartnerStore((s) => s.getRepsByPartner)
  const getPartnerOrders = usePartnerStore((s) => s.getPartnerOrders)
  const getPartnerMetrics = usePartnerStore((s) => s.getPartnerMetrics)
  const customers = useCustomerStore((s) => s.customers)
  const { products } = initializeMockData()

  const [selectedRep, setSelectedRep] = useState<PartnerRep | null>(null)

  const partner = getPartnerById(id ?? "")
  const reps = useMemo(
    () => (partner ? getRepsByPartner(partner.id) : []),
    [partner, getRepsByPartner]
  )
  const partnerOrders = useMemo(
    () => (partner ? getPartnerOrders(partner.id) : []),
    [partner, getPartnerOrders]
  )
  const metrics = partner ? getPartnerMetrics(partner.id) : null

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )
  const repMap = useMemo(
    () => new Map(reps.map((r) => [r.id, r])),
    [reps]
  )
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )

  // Order rows with customer and rep names
  const orderRows: OrderRow[] = useMemo(() => {
    return partnerOrders
      .map((o) => {
        const customer = customerMap.get(o.customerId)
        const rep = o.partnerRepId ? repMap.get(o.partnerRepId) : undefined
        return {
          ...o,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Unknown",
          repName: rep ? `${rep.firstName} ${rep.lastName}` : "—",
        }
      })
      .sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
  }, [partnerOrders, customerMap, repMap])

  // Trend chart data: group orders by month
  const trendData = useMemo(() => {
    const monthMap = new Map<string, { revenue: number; orders: number }>()
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    for (const o of partnerOrders) {
      const date = new Date(o.orderDate)
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`
      const existing = monthMap.get(key) ?? { revenue: 0, orders: 0 }
      existing.revenue += o.totalPrice
      existing.orders += 1
      monthMap.set(key, existing)
    }
    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: Math.round(data.revenue),
        orders: data.orders,
      }))
      .slice(-12)
  }, [partnerOrders])

  // Rep's orders for sheet
  const repOrders = useMemo(() => {
    if (!selectedRep) return []
    return orderRows.filter((o) => o.partnerRepId === selectedRep.id)
  }, [selectedRep, orderRows])

  const orderColumns: ColumnDef<OrderRow>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order #",
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
        accessorKey: "productId",
        header: "Product",
        cell: ({ row }) => {
          const product = productMap.get(row.original.productId)
          return (
            <span className="text-sm text-muted-foreground">
              {product?.name ?? "Unknown"}
            </span>
          )
        },
      },
      {
        accessorKey: "repName",
        header: "Rep",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.repName}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} type="order" />
        ),
      },
      {
        accessorKey: "orderDate",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.orderDate)}
          </span>
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.totalPrice)}
          </span>
        ),
      },
    ],
    [productMap]
  )

  const repColumns: ColumnDef<PartnerRep>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Name
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <button
            className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
            onClick={() => setSelectedRep(row.original)}
          >
            {row.original.firstName} {row.original.lastName}
          </button>
        ),
      },
      {
        accessorKey: "territory",
        header: "Territory",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.territory}
          </span>
        ),
      },
      {
        accessorKey: "totalOrders",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Total Orders
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.totalOrders}</span>
        ),
      },
      {
        accessorKey: "totalRevenue",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Total Revenue
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.totalRevenue)}
          </span>
        ),
      },
      {
        accessorKey: "averageReturnRate",
        header: "Avg Return Rate",
        cell: ({ row }) => {
          const rate = row.original.averageReturnRate
          const color =
            rate > 8
              ? "text-red-600"
              : rate > 5
                ? "text-amber-600"
                : "text-emerald-600"
          return (
            <span className={`text-sm font-medium ${color}`}>{rate}%</span>
          )
        },
      },
    ],
    []
  )

  if (!partner) {
    return (
      <PageContainer title="Partner Not Found">
        <p className="text-muted-foreground">
          No partner found with ID "{id}".
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/partners">Back to Partners</Link>
        </Button>
      </PageContainer>
    )
  }

  const TYPE_COLORS: Record<string, string> = {
    Clothier:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    Corporate:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    Retailer:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  }

  return (
    <PageContainer title={partner.name}>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/partners">
            <ArrowLeft className="size-3.5" />
            Back to Partners
          </Link>
        </Button>

        {/* Partner header */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{partner.name}</h2>
                <Badge
                  variant="secondary"
                  className={`text-xs ${TYPE_COLORS[partner.type] ?? ""}`}
                >
                  {partner.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {partner.address.street}, {partner.address.city},{" "}
                {partner.address.state} {partner.address.zip}
              </p>
              <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Contact: {partner.contactEmail}</span>
                <span>{partner.contactPhone}</span>
                <span>Terms: {partner.paymentTerms}</span>
                <span>Since: {formatDate(partner.accountSince)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">
              Orders ({orderRows.length})
            </TabsTrigger>
            <TabsTrigger value="reps">Reps ({reps.length})</TabsTrigger>
          </TabsList>

          {/* Overview tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              <Card>
                <CardContent className="px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold text-emerald-600">
                    {formatCurrency(metrics?.totalRevenue ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold">
                    {metrics?.totalOrders ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold">
                    {metrics?.activeOrders ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active Orders
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold">
                    {formatCurrency(metrics?.avgOrderValue ?? 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg Order Value
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="px-3 py-2.5 text-center">
                  <p
                    className={`text-lg font-semibold ${
                      (metrics?.avgReturnRate ?? 0) > 8
                        ? "text-red-600"
                        : (metrics?.avgReturnRate ?? 0) > 5
                          ? "text-amber-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {metrics?.avgReturnRate ?? 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Avg Return Rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            {trendData.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">
                    Revenue & Order Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-border"
                        />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 10 }}
                          className="fill-muted-foreground"
                        />
                        <YAxis
                          yAxisId="revenue"
                          tick={{ fontSize: 10 }}
                          className="fill-muted-foreground"
                          tickFormatter={(v) =>
                            `$${(v / 1000).toFixed(0)}k`
                          }
                        />
                        <YAxis
                          yAxisId="orders"
                          orientation="right"
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
                            name === "revenue"
                              ? formatCurrency(value ?? 0)
                              : (value ?? 0),
                            name === "revenue" ? "Revenue" : "Orders",
                          ]}
                        />
                        <Line
                          yAxisId="revenue"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#4338ca"
                          strokeWidth={2}
                          dot={false}
                          name="revenue"
                        />
                        <Line
                          yAxisId="orders"
                          type="monotone"
                          dataKey="orders"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={false}
                          name="orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Orders tab */}
          <TabsContent value="orders">
            <DataTable columns={orderColumns} data={orderRows} pageSize={20} />
          </TabsContent>

          {/* Reps tab */}
          <TabsContent value="reps">
            <DataTable columns={repColumns} data={reps} pageSize={20} />
          </TabsContent>
        </Tabs>

        {/* Rep orders sheet */}
        <Sheet
          open={selectedRep !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedRep(null)
          }}
        >
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>
                {selectedRep
                  ? `${selectedRep.firstName} ${selectedRep.lastName}'s Orders`
                  : "Rep Orders"}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3">
              {selectedRep && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Territory: {selectedRep.territory}</span>
                  <span>
                    Revenue: {formatCurrency(selectedRep.totalRevenue)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                {repOrders.length > 0 ? (
                  repOrders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <Link
                          to={`/orders/${o.id}`}
                          className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                        >
                          {o.id}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {o.customerName} · {formatDate(o.orderDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(o.totalPrice)}
                        </p>
                        <StatusBadge status={o.status} type="order" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No orders found for this rep.
                  </p>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </PageContainer>
  )
}
