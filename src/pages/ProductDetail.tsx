import { useMemo } from "react"
import { useParams, Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowLeft } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useProductionStore } from "@/stores/useProductionStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { initializeMockData } from "@/data/mockData"
import type { Order, FabricFamily } from "@/data/types"

const FABRIC_FAMILY_COLORS: Record<FabricFamily, string> = {
  "Raw Denim": "bg-indigo-700",
  "Cotton Chino": "bg-amber-600",
  Performance: "bg-slate-500",
  "Cashiers Collection": "bg-blue-900",
}

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
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { products } = initializeMockData()
  const orders = useProductionStore((s) => s.orders)
  const customers = useCustomerStore((s) => s.customers)
  const fabricRolls = useInventoryStore((s) => s.fabricRolls)

  const product = products.find((p) => p.id === id)

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )

  // Fabric roll info for this product's family
  const familyRolls = useMemo(() => {
    if (!product) return []
    return fabricRolls.filter((r) => r.fabricFamily === product.fabricFamily)
  }, [fabricRolls, product])

  // Orders for this product
  const productOrders: OrderRow[] = useMemo(() => {
    if (!product) return []
    return orders
      .filter((o) => o.productId === product.id)
      .map((o) => {
        const customer = customerMap.get(o.customerId)
        return {
          ...o,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Unknown",
        }
      })
      .sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
  }, [product, orders, customerMap])

  // Stats
  const stats = useMemo(() => {
    const totalSold = productOrders.length
    const revenue = productOrders.reduce((sum, o) => sum + o.totalPrice, 0)

    // Most popular customization choices
    const customCounts = new Map<string, number>()
    for (const o of productOrders) {
      if (o.pocketStyle) {
        customCounts.set(
          o.pocketStyle,
          (customCounts.get(o.pocketStyle) ?? 0) + 1
        )
      }
      if (o.hardware) {
        customCounts.set(
          o.hardware,
          (customCounts.get(o.hardware) ?? 0) + 1
        )
      }
      if (o.threadColor) {
        customCounts.set(
          o.threadColor,
          (customCounts.get(o.threadColor) ?? 0) + 1
        )
      }
    }
    const topCustomizations = Array.from(customCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return { totalSold, revenue, topCustomizations }
  }, [productOrders])

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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} type="order" />
        ),
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.channel}
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
      {
        accessorKey: "orderDate",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.orderDate)}
          </span>
        ),
      },
    ],
    []
  )

  if (!product) {
    return (
      <PageContainer title="Product Not Found">
        <p className="text-muted-foreground">
          No product found with ID "{id}".
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/products">Back to Products</Link>
        </Button>
      </PageContainer>
    )
  }

  const sampleRoll = familyRolls[0]

  return (
    <PageContainer title={product.name}>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/products">
            <ArrowLeft className="size-3.5" />
            Back to Products
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Product info */}
            <Card className="overflow-hidden">
              <div
                className={`h-2 ${FABRIC_FAMILY_COLORS[product.fabricFamily]}`}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.isActive ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-red-600">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                    {formatCurrency(product.basePrice)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>

                <Separator />

                {/* Fabric family info */}
                <div>
                  <h4 className="text-sm font-semibold">Fabric Family</h4>
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Family</p>
                      <p className="text-sm font-medium">
                        {product.fabricFamily}
                      </p>
                    </div>
                    {sampleRoll && (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Composition
                          </p>
                          <p className="text-sm font-medium">
                            {sampleRoll.composition}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Weight
                          </p>
                          <p className="text-sm font-medium">
                            {sampleRoll.weightOz} oz
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Rolls Available
                          </p>
                          <p className="text-sm font-medium">
                            {
                              familyRolls.filter(
                                (r) => r.status === "Active" || r.status === "Low"
                              ).length
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Customization options */}
                <div>
                  <h4 className="text-sm font-semibold">
                    Customization Options
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.customizationOptions.map((opt) => (
                      <Badge key={opt} variant="outline" className="text-xs">
                        {opt}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders for this product */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Orders for This Product ({productOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productOrders.length > 0 ? (
                  <DataTable
                    columns={orderColumns}
                    data={productOrders}
                    pageSize={10}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No orders for this product yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-lg font-semibold">{stats.totalSold}</p>
                    <p className="text-xs text-muted-foreground">
                      Total Units Sold
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-emerald-600">
                      {formatCurrency(stats.revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Revenue Generated
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Popular Customizations
                  </p>
                  {stats.topCustomizations.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {stats.topCustomizations.map(([name, count]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs">{name}</span>
                          <span className="text-xs text-muted-foreground">
                            {count}x
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                      No data yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
