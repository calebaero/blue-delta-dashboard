import { useEffect } from "react"
import { useParams, Link } from "react-router"
import {
  Package,
  User,
  Truck,
  Scissors,
  Calendar,
  Hash,
} from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { PageLoadingState } from "@/components/shared/PageLoadingState"
import { PipelineStepper } from "@/components/shared/PipelineStepper"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useOrderStore } from "@/stores/useOrderStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useShippingStore } from "@/stores/useShippingStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { useProductStore } from "@/stores/useProductStore"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const getOrderById = useOrderStore((s) => s.getOrderById)
  const getCustomerById = useCustomerStore((s) => s.getCustomerById)
  const getActiveMeasurement = useCustomerStore((s) => s.getActiveMeasurement)
  const getShipmentByOrder = useShippingStore((s) => s.getShipmentByOrder)
  const getRollById = useInventoryStore((s) => s.getRollById)
  const products = useProductStore((s) => s.products)
  const fetchOrderData = useOrderStore((s) => s.fetchData)
  const fetchCustomerData = useCustomerStore((s) => s.fetchData)
  const fetchShippingData = useShippingStore((s) => s.fetchData)
  const fetchInventoryData = useInventoryStore((s) => s.fetchData)
  const fetchProductData = useProductStore((s) => s.fetchData)
  const orderLoading = useOrderStore((s) => s.isLoading)
  const customerLoading = useCustomerStore((s) => s.isLoading)
  const shippingLoading = useShippingStore((s) => s.isLoading)
  const inventoryLoading = useInventoryStore((s) => s.isLoading)
  const productLoading = useProductStore((s) => s.isLoading)
  const orderError = useOrderStore((s) => s.error)
  const customerError = useCustomerStore((s) => s.error)
  const shippingError = useShippingStore((s) => s.error)
  const inventoryError = useInventoryStore((s) => s.error)
  const productError = useProductStore((s) => s.error)
  const isLoading = orderLoading || customerLoading || shippingLoading || inventoryLoading || productLoading
  const error = orderError || customerError || shippingError || inventoryError || productError

  useEffect(() => {
    fetchOrderData()
    fetchCustomerData()
    fetchShippingData()
    fetchInventoryData()
    fetchProductData()
  }, [])

  const productMap = new Map(products.map((p) => [p.id, p]))

  const order = id ? getOrderById(id) : undefined

  if (!order) {
    return (
      <PageContainer title="Order Not Found">
        <p className="text-muted-foreground">
          No order found with ID: {id}
        </p>
      </PageContainer>
    )
  }

  const customer = getCustomerById(order.customerId)
  const product = productMap.get(order.productId)
  const shipment = order.shipmentId
    ? getShipmentByOrder(order.id)
    : undefined
  const fabricRoll = order.fabricRollId
    ? getRollById(order.fabricRollId)
    : undefined
  const measurement = getActiveMeasurement(order.customerId)

  return (
    <PageContainer title={`Order ${order.id}`}>
      <PageLoadingState isLoading={isLoading} error={error}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — Summary Cards */}
        <div className="space-y-4">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Hash className="size-4" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={order.status} type="order" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="font-medium">{order.channel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">
                    {formatDate(order.orderDate)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Promise Date</span>
                  <span className="font-medium">
                    {formatDate(order.promisedDate)}
                  </span>
                </div>
                {order.completedDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">
                      {formatDate(order.completedDate)}
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium">
                    {formatCurrency(order.unitPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-semibold">
                    Total
                  </span>
                  <span className="text-base font-semibold">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <User className="size-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-2 text-sm">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                  >
                    {customer.firstName} {customer.lastName}
                  </Link>
                  <p className="text-muted-foreground">{customer.email}</p>
                  <p className="text-muted-foreground">
                    {customer.shippingAddress.city},{" "}
                    {customer.shippingAddress.state}
                  </p>
                  <StatusBadge status={customer.loyaltyTier} type="tier" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Unknown customer</p>
              )}
            </CardContent>
          </Card>

          {/* Product & Customization */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Package className="size-4" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product</span>
                  <span className="font-medium">
                    {product?.name ?? "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thread Color</span>
                  <span>{order.threadColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pocket Style</span>
                  <span>{order.pocketStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hardware</span>
                  <span>{order.hardware}</span>
                </div>
                {order.monogram && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monogram</span>
                    <span>
                      {order.monogram}
                      {order.monogramStyle && ` (${order.monogramStyle})`}
                    </span>
                  </div>
                )}
                {fabricRoll && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fabric</span>
                      <span>
                        {fabricRoll.color} {fabricRoll.fabricFamily}
                      </span>
                    </div>
                    {order.yardageUsed && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Yardage Used
                        </span>
                        <span>{order.yardageUsed} yds</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Artisan */}
          {order.assignedArtisan && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Scissors className="size-4" />
                  Artisan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{order.assignedArtisan}</p>
              </CardContent>
            </Card>
          )}

          {/* B2B Info */}
          {order.partnerId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  B2B Partner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Link
                    to={`/partners/${order.partnerId}`}
                    className="font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                  >
                    {order.partnerId}
                  </Link>
                  {order.partnerOrderRef && (
                    <p className="text-muted-foreground">
                      Ref: {order.partnerOrderRef}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {(order.orderNote || order.giftNote) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {order.orderNote && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Order Note
                      </p>
                      <p>{order.orderNote}</p>
                    </div>
                  )}
                  {order.giftNote && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Gift Note
                      </p>
                      <p className="italic">{order.giftNote}</p>
                      {order.giftRecipient && (
                        <p className="text-muted-foreground">
                          To: {order.giftRecipient}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT — Pipeline Stepper + Shipping */}
        <div className="space-y-6 lg:col-span-2">
          {/* Pipeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Calendar className="size-4" />
                Production Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineStepper
                currentStatus={order.status}
                stages={order.pipelineStages}
              />
            </CardContent>
          </Card>

          {/* Shipping tracking */}
          {shipment && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Truck className="size-4" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Carrier: </span>
                      <span className="font-medium">{shipment.carrier}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tracking: </span>
                      <span className="font-medium font-mono text-xs">
                        {shipment.trackingNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status: </span>
                      <StatusBadge
                        status={shipment.status}
                        type="shipment"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-0">
                    {shipment.stages.map((stage, idx) => {
                      const isLast = idx === shipment.stages.length - 1
                      return (
                        <div key={stage.status} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                isLast
                                  ? "bg-indigo-600 text-white"
                                  : "bg-emerald-500 text-white"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            {idx < shipment.stages.length - 1 && (
                              <div className="h-6 w-0.5 bg-border" />
                            )}
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-medium">
                              {stage.status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(stage.timestamp)}
                              {stage.location && ` — ${stage.location}`}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Measurement snapshot */}
          {measurement && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Measurement Snapshot
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Active profile — {measurement.source} ({formatDate(measurement.dateTaken)})
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
                  {[
                    { label: "Waist", value: measurement.waist },
                    { label: "Seat", value: measurement.seat },
                    { label: "Thigh", value: measurement.thigh },
                    { label: "Inseam", value: measurement.inseam },
                    { label: "Rise (F)", value: measurement.riseFront },
                    { label: "Rise (B)", value: measurement.riseBack },
                    { label: "Hip", value: measurement.hip },
                    { label: "Knee", value: measurement.knee },
                    { label: "Outseam", value: measurement.outseam },
                    { label: "Leg Open", value: measurement.legOpening },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="rounded-md bg-muted/50 p-2 text-center"
                    >
                      <p className="text-xs text-muted-foreground">
                        {m.label}
                      </p>
                      <p className="text-sm font-semibold">{m.value}&Prime;</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </PageLoadingState>
    </PageContainer>
  )
}
