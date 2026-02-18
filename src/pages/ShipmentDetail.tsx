import { useMemo } from "react"
import { useParams, Link } from "react-router"
import {
  ArrowLeft,
  Truck,
  Package,
  MapPin,
  Clock,
  Check,
  Circle,
} from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useShippingStore } from "@/stores/useShippingStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useProductionStore } from "@/stores/useProductionStore"
import { initializeMockData } from "@/data/mockData"
import type { ShipmentStatus } from "@/data/types"

const STATUS_ORDER: ShipmentStatus[] = [
  "Label Created",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered",
]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  const hours = date.getHours()
  const mins = date.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHour = hours % 12 || 12
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${displayHour}:${mins} ${ampm}`
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export default function ShipmentDetailPage() {
  const { id } = useParams()
  const getShipmentById = useShippingStore((s) => s.getShipmentById)
  const customers = useCustomerStore((s) => s.customers)
  const orders = useProductionStore((s) => s.orders)
  const { products } = initializeMockData()

  const shipment = getShipmentById(id ?? "")

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )
  const orderMap = useMemo(
    () => new Map(orders.map((o) => [o.id, o])),
    [orders]
  )
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )

  if (!shipment) {
    return (
      <PageContainer title="Shipment Not Found">
        <p className="text-muted-foreground">
          No shipment found with ID "{id}".
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/shipping">Back to Shipping</Link>
        </Button>
      </PageContainer>
    )
  }

  const customer = customerMap.get(shipment.customerId)
  const order = orderMap.get(shipment.orderId)
  const product = order ? productMap.get(order.productId) : undefined

  const currentStatusIdx = STATUS_ORDER.indexOf(shipment.status)

  // Build stepper data from stages
  const stageMap = new Map(
    shipment.stages.map((s) => [s.status, s])
  )

  const carrierIcon =
    shipment.carrier === "UPS" ? (
      <Package className="size-4 text-amber-700" />
    ) : shipment.carrier === "FedEx" ? (
      <Truck className="size-4 text-violet-600" />
    ) : (
      <Package className="size-4 text-blue-600" />
    )

  const deliveryDays =
    shipment.actualDelivery && shipment.shippedDate
      ? Math.floor(
          (new Date(shipment.actualDelivery).getTime() -
            new Date(shipment.shippedDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

  const isOnTime =
    shipment.actualDelivery &&
    shipment.actualDelivery <= shipment.estimatedDelivery

  return (
    <PageContainer title={`Shipment ${shipment.id}`}>
      <div className="space-y-6">
        {/* Back link */}
        <Button asChild variant="ghost" size="sm" className="gap-1">
          <Link to="/shipping">
            <ArrowLeft className="size-3.5" />
            Back to Shipping
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column: main info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Shipment info card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {carrierIcon}
                    <CardTitle className="text-lg">
                      {shipment.carrier} Shipment
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      shipment.status === "Delivered"
                        ? "border-emerald-300 text-emerald-700 dark:text-emerald-400"
                        : shipment.status === "In Transit"
                          ? "border-blue-300 text-blue-700 dark:text-blue-400"
                          : "border-amber-300 text-amber-700 dark:text-amber-400"
                    }
                  >
                    {shipment.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Tracking #</p>
                    <p className="font-mono text-sm">{shipment.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Carrier</p>
                    <p className="text-sm font-medium">{shipment.carrier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-sm font-medium">{shipment.weight}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Shipping Cost
                    </p>
                    <p className="text-sm font-medium">
                      {formatCurrency(shipment.cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Shipped Date
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(shipment.shippedDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Est. Delivery
                    </p>
                    <p className="text-sm font-medium">
                      {formatDate(shipment.estimatedDelivery)}
                    </p>
                  </div>
                  {shipment.actualDelivery && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Actual Delivery
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(shipment.actualDelivery)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Transit Time
                        </p>
                        <p className="text-sm font-medium">
                          {deliveryDays} day{deliveryDays !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          On Time
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            isOnTime
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {isOnTime ? "Yes" : "Late"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking stepper */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">
                    Tracking Progress
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative ml-3">
                  {STATUS_ORDER.map((status, idx) => {
                    const stage = stageMap.get(status)
                    const isCompleted = idx < currentStatusIdx
                    const isCurrent = idx === currentStatusIdx
                    const isFuture = idx > currentStatusIdx

                    return (
                      <div key={status} className="relative flex gap-4 pb-8 last:pb-0">
                        {/* Vertical line */}
                        {idx < STATUS_ORDER.length - 1 && (
                          <div
                            className={`absolute left-[11px] top-6 h-full w-0.5 ${
                              isCompleted
                                ? "bg-emerald-500"
                                : isCurrent
                                  ? "bg-indigo-300"
                                  : "bg-muted"
                            }`}
                          />
                        )}

                        {/* Icon */}
                        <div className="relative z-10 flex shrink-0 items-center justify-center">
                          {isCompleted ? (
                            <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500">
                              <Check className="size-3.5 text-white" />
                            </div>
                          ) : isCurrent ? (
                            <div className="flex size-6 items-center justify-center rounded-full border-2 border-indigo-500 bg-white dark:bg-background">
                              <Circle className="size-2.5 animate-pulse fill-indigo-500 text-indigo-500" />
                            </div>
                          ) : (
                            <div className="flex size-6 items-center justify-center rounded-full border-2 border-muted bg-white dark:bg-background">
                              <Circle className="size-2.5 text-muted" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              isFuture
                                ? "text-muted-foreground"
                                : ""
                            }`}
                          >
                            {status}
                          </p>
                          {stage && (
                            <div className="mt-0.5 space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="size-3" />
                                {formatDateTime(stage.timestamp)}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="size-3" />
                                {stage.location}
                              </div>
                            </div>
                          )}
                          {isFuture && !stage && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Pending
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: sidebar */}
          <div className="space-y-6">
            {/* Order info */}
            {order && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Order Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Order #
                    </span>
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                      {order.id}
                    </Link>
                  </div>
                  {product && (
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Product
                      </span>
                      <span className="text-sm">{product.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Total
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Channel
                    </span>
                    <span className="text-sm">{order.channel}</span>
                  </div>
                  {order.assignedArtisan && (
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Artisan
                      </span>
                      <span className="text-sm">
                        {order.assignedArtisan}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Customer info */}
            {customer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Name</span>
                    <Link
                      to={`/customers/${customer.id}`}
                      className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                      {customer.firstName} {customer.lastName}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Email
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">
                      Phone
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {customer.phone}
                    </span>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Shipping Address
                    </p>
                    <div className="mt-1 text-sm">
                      <p>{shipment.shippingAddress.street}</p>
                      <p>
                        {shipment.shippingAddress.city},{" "}
                        {shipment.shippingAddress.state}{" "}
                        {shipment.shippingAddress.zip}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Delivery Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {shipment.stages.length}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Checkpoints
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {STATUS_ORDER.length - currentStatusIdx - 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Remaining
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
