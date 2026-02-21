import { useEffect, useState, useMemo } from "react"
import { useParams, Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowLeft, Scissors, MapPin, Calendar, Package } from "lucide-react"
import { toast } from "sonner"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PageLoadingState } from "@/components/shared/PageLoadingState"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { useProductionStore } from "@/stores/useProductionStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useProductStore } from "@/stores/useProductStore"
import type { Order } from "@/data/types"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

interface OrderRow extends Order {
  customerName: string
  productName: string
}

export default function RollDetailPage() {
  const { id } = useParams()
  const getRollById = useInventoryStore((s) => s.getRollById)
  const deductYardage = useInventoryStore((s) => s.deductYardage)
  const orders = useProductionStore((s) => s.orders)
  const customers = useCustomerStore((s) => s.customers)
  const products = useProductStore((s) => s.products)

  const fetchInventoryData = useInventoryStore((s) => s.fetchData)
  const fetchProductionData = useProductionStore((s) => s.fetchData)
  const fetchCustomerData = useCustomerStore((s) => s.fetchData)
  const fetchProductData = useProductStore((s) => s.fetchData)
  const inventoryLoading = useInventoryStore((s) => s.isLoading)
  const productionLoading = useProductionStore((s) => s.isLoading)
  const customerLoading = useCustomerStore((s) => s.isLoading)
  const productLoading = useProductStore((s) => s.isLoading)
  const inventoryError = useInventoryStore((s) => s.error)
  const productionError = useProductionStore((s) => s.error)
  const customerError = useCustomerStore((s) => s.error)
  const productError = useProductStore((s) => s.error)
  const isLoading = inventoryLoading || productionLoading || customerLoading || productLoading
  const error = inventoryError || productionError || customerError || productError

  useEffect(() => {
    fetchInventoryData()
    fetchProductionData()
    fetchCustomerData()
    fetchProductData()
  }, [])

  const [deductAmount, setDeductAmount] = useState("")

  const roll = getRollById(id ?? "")

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )

  // Orders that used this fabric roll
  const rollOrders: OrderRow[] = useMemo(() => {
    if (!roll) return []
    return orders
      .filter((o) => o.fabricRollId === roll.id)
      .map((o) => {
        const customer = customerMap.get(o.customerId)
        const product = productMap.get(o.productId)
        return {
          ...o,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Unknown",
          productName: product?.name ?? "Unknown",
        }
      })
      .sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      )
  }, [roll, orders, customerMap, productMap])

  // Consumption history: simulated from orders with yardageUsed
  const consumptionHistory = useMemo(() => {
    return rollOrders
      .filter((o) => o.yardageUsed)
      .map((o) => ({
        orderId: o.id,
        date: o.orderDate,
        yards: o.yardageUsed!,
        artisan: o.assignedArtisan ?? "Unassigned",
        stage: o.status,
      }))
  }, [rollOrders])

  const totalConsumed = useMemo(() => {
    if (!roll) return 0
    return roll.initialYards - roll.currentYards
  }, [roll])

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
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} type="order" />
        ),
      },
      {
        accessorKey: "yardageUsed",
        header: "Yards Used",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.yardageUsed
              ? `${row.original.yardageUsed} yd`
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "orderDate",
        header: "Order Date",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.orderDate)}
          </span>
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
    ],
    []
  )

  if (!roll) {
    return (
      <PageContainer title="Roll Not Found">
        <p className="text-muted-foreground">
          No fabric roll found with ID "{id}".
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/inventory">Back to Inventory</Link>
        </Button>
      </PageContainer>
    )
  }

  const usagePct = (roll.currentYards / roll.initialYards) * 100
  const statusColor =
    roll.status === "Active"
      ? "text-emerald-600"
      : roll.status === "Low"
        ? "text-amber-600"
        : roll.status === "Depleted"
          ? "text-red-600"
          : "text-purple-600"

  function handleDeduct() {
    const yards = parseFloat(deductAmount)
    if (isNaN(yards) || yards <= 0) {
      toast.error("Please enter a valid yardage amount")
      return
    }
    if (yards > roll!.currentYards) {
      toast.error(
        `Cannot deduct ${yards} yd — only ${roll!.currentYards} yd available`
      )
      return
    }
    const success = deductYardage(roll!.id, yards)
    if (success) {
      toast.success(
        `Deducted ${yards} yd from ${roll!.color} ${roll!.fabricFamily}. Remaining: ${(roll!.currentYards - yards).toFixed(1)} yd`
      )
      setDeductAmount("")
    } else {
      toast.error("Failed to deduct yardage")
    }
  }

  return (
    <PageContainer title={`Roll ${roll.materialName}`}>
      <PageLoadingState isLoading={isLoading} error={error}>
      <div className="space-y-6">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/inventory">
            <ArrowLeft className="size-3.5" />
            Back to Inventory
          </Link>
        </Button>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Roll details card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Roll Details</CardTitle>
                  <Badge
                    variant="outline"
                    className={statusColor}
                  >
                    {roll.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Material</p>
                    <p className="text-sm font-medium">{roll.materialName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fabric Family
                    </p>
                    <p className="text-sm font-medium">{roll.fabricFamily}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Color</p>
                    <p className="text-sm font-medium">{roll.color}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-sm font-medium">{roll.weightOz} oz</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Composition</p>
                    <p className="text-sm font-medium">{roll.composition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Width</p>
                    <p className="text-sm font-medium">
                      {roll.widthInches}"
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Supplier</p>
                    <p className="text-sm font-medium">{roll.supplier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Batch / Dye Lot
                    </p>
                    <p className="font-mono text-xs">{roll.batchDyeLot}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Cost per Yard
                    </p>
                    <p className="text-sm font-medium">
                      {formatCurrency(roll.costPerYard)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Shrinkage (Warp)
                    </p>
                    <p className="text-sm font-medium">
                      {roll.shrinkageWarpPct}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Shrinkage (Weft)
                    </p>
                    <p className="text-sm font-medium">
                      {roll.shrinkageWeftPct}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{roll.location}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Received: {formatDate(roll.receivedDate)}
                  </span>
                </div>

                {roll.notes && (
                  <p className="text-sm text-muted-foreground italic">
                    {roll.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Orders cut from this roll */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scissors className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">
                    Orders Cut from This Roll ({rollOrders.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {rollOrders.length > 0 ? (
                  <DataTable
                    columns={orderColumns}
                    data={rollOrders}
                    pageSize={10}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No orders have been cut from this roll yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Yardage card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Yardage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-semibold">
                      {roll.currentYards} yd
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        usagePct > 50
                          ? "bg-emerald-500"
                          : usagePct > 25
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(usagePct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0 yd</span>
                    <span>{roll.initialYards} yd</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {roll.initialYards}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Initial Yards
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {totalConsumed.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Consumed</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {roll.reorderPointYards}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reorder Point
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {rollOrders.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Orders Cut
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Deduct yardage demo */}
                <div className="space-y-2">
                  <Label htmlFor="deduct-yards" className="text-xs">
                    Deduct Yardage
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="deduct-yards"
                      type="number"
                      step="0.5"
                      min="0.5"
                      placeholder="Yards"
                      value={deductAmount}
                      onChange={(e) => setDeductAmount(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      className="h-8 bg-indigo-700 hover:bg-indigo-800"
                      onClick={handleDeduct}
                    >
                      Deduct
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consumption history */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Consumption History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {consumptionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {consumptionHistory.map((entry) => (
                      <div
                        key={entry.orderId}
                        className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <Link
                            to={`/orders/${entry.orderId}`}
                            className="text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                          >
                            {entry.orderId}
                          </Link>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDate(entry.date)} · {entry.artisan}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Package className="size-3 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            {entry.yards} yd
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No consumption records yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </PageLoadingState>
    </PageContainer>
  )
}
