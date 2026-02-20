import { useMemo } from "react"
import { useParams, Link } from "react-router"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
import type { ColumnDef } from "@tanstack/react-table"
import {
  Mail,
  Phone,
  MapPin,
  Crown,
  Gift,
  Star,
  User,
  Package,
} from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useOrderStore } from "@/stores/useOrderStore"
import { initializeMockData } from "@/data/mockData"
import type { Customer, Order, MeasurementProfile } from "@/data/types"

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

export default function CustomerDetailPage() {
  const { id } = useParams()
  const getCustomerById = useCustomerStore((s) => s.getCustomerById)
  const getCustomerMeasurements = useCustomerStore(
    (s) => s.getCustomerMeasurements
  )
  const getActiveMeasurement = useCustomerStore((s) => s.getActiveMeasurement)
  const getOrdersByCustomer = useOrderStore((s) => s.getOrdersByCustomer)
  const { products } = initializeMockData()

  const customer = id ? getCustomerById(id) : undefined
  const measurements = id ? getCustomerMeasurements(id) : []
  const activeMeasurement = id ? getActiveMeasurement(id) : undefined
  const customerOrders = id ? getOrdersByCustomer(id) : []

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )

  if (!customer) {
    return (
      <PageContainer title="Customer Not Found">
        <p className="text-muted-foreground">
          No customer found with ID: {id}
        </p>
      </PageContainer>
    )
  }

  const initials = `${customer.firstName[0]}${customer.lastName[0]}`

  const orderColumns: ColumnDef<Order>[] = [
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
      accessorKey: "productId",
      header: "Product",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {productMap.get(row.original.productId)?.name ?? "Unknown"}
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
  ]

  // Radar chart data from active measurement
  const radarData = activeMeasurement
    ? [
        { metric: "Waist", value: activeMeasurement.waist, fullMark: 50 },
        { metric: "Seat", value: activeMeasurement.seat, fullMark: 50 },
        { metric: "Thigh", value: activeMeasurement.thigh, fullMark: 35 },
        { metric: "Knee", value: activeMeasurement.knee, fullMark: 25 },
        { metric: "Inseam", value: activeMeasurement.inseam, fullMark: 40 },
        { metric: "Outseam", value: activeMeasurement.outseam, fullMark: 50 },
        {
          metric: "Rise (F)",
          value: activeMeasurement.riseFront,
          fullMark: 18,
        },
        {
          metric: "Rise (B)",
          value: activeMeasurement.riseBack,
          fullMark: 22,
        },
        { metric: "Hip", value: activeMeasurement.hip, fullMark: 50 },
        {
          metric: "Leg Open",
          value: activeMeasurement.legOpening,
          fullMark: 25,
        },
      ]
    : []

  return (
    <PageContainer
      title={`${customer.firstName} ${customer.lastName}`}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — Summary card */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-indigo-100 text-lg font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-3 text-lg font-semibold">
                  {customer.firstName} {customer.lastName}
                </h2>
                {customer.nickname && (
                  <p className="text-sm text-muted-foreground">
                    &ldquo;{customer.nickname}&rdquo;
                  </p>
                )}
                <div className="mt-2">
                  <StatusBadge status={customer.loyaltyTier} type="tier" />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>
                    {customer.shippingAddress.city},{" "}
                    {customer.shippingAddress.state}
                  </span>
                </div>
                {customer.company && (
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-muted-foreground" />
                    <span>{customer.company}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Key stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <p className="text-lg font-semibold">
                    {customer.totalOrders}
                  </p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <p className="text-lg font-semibold">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <p className="text-lg font-semibold">
                    {formatCurrency(customer.averageOrderSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Order</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2.5 text-center">
                  <p className="text-lg font-semibold">
                    {customer.rewardPoints}
                  </p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="font-medium">{customer.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Since</span>
                  <span className="font-medium">
                    {formatDate(customer.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Order</span>
                  <span className="font-medium">
                    {formatDate(customer.lastOrderDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">How Heard</span>
                  <span className="font-medium">
                    {customer.howHeardAboutUs}
                  </span>
                </div>
                {customer.isWhiteGlove && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Crown className="size-3.5" />
                    <span className="font-medium">White Glove</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="contact">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="contact">
                <User className="mr-1.5 size-3.5" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Package className="mr-1.5 size-3.5" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="measurements">
                <Star className="mr-1.5 size-3.5" />
                Measurements
              </TabsTrigger>
              <TabsTrigger value="gifting">
                <Gift className="mr-1.5 size-3.5" />
                Gifting
              </TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-4">
              <ContactTab customer={customer} />
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    Order History ({customerOrders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={orderColumns}
                    data={customerOrders}
                    pageSize={10}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Measurements Tab */}
            <TabsContent value="measurements" className="mt-4">
              <MeasurementsTab
                measurements={measurements}
                activeMeasurement={activeMeasurement}
                radarData={radarData}
              />
            </TabsContent>

            {/* Gifting Tab */}
            <TabsContent value="gifting" className="mt-4">
              <GiftingTab orders={customerOrders} />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-4">
              <PreferencesTab customer={customer} />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-4">
              <NotesTab customer={customer} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  )
}

// ─── Contact Tab ─────────────────────────────────────────────
function ContactTab({
  customer,
}: {
  customer: Customer
}) {
  const c = customer

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p>{c.shippingAddress.street}</p>
          <p>
            {c.shippingAddress.city}, {c.shippingAddress.state}{" "}
            {c.shippingAddress.zip}
          </p>
        </CardContent>
      </Card>

      {c.billingAddress && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Billing Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{c.billingAddress.street}</p>
            <p>
              {c.billingAddress.city}, {c.billingAddress.state}{" "}
              {c.billingAddress.zip}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{c.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{c.phone}</span>
            </div>
            {c.landLine && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Landline</span>
                <span>{c.landLine}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preferred Contact</span>
              <span>{c.preferredContact}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Contact</span>
              <span>
                {c.lastContactMethod} — {formatDate(c.lastContactDate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Personal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {c.dateOfBirth && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date of Birth</span>
                <span>{formatDate(c.dateOfBirth)}</span>
              </div>
            )}
            {c.height && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Height</span>
                <span>{c.height}</span>
              </div>
            )}
            {c.weight && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span>{c.weight}</span>
              </div>
            )}
            {c.spouseName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spouse</span>
                <span>{c.spouseName}</span>
              </div>
            )}
            {c.socialMediaHandles && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Social</span>
                <span>{c.socialMediaHandles}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Measurements Tab ────────────────────────────────────────
function MeasurementsTab({
  measurements,
  activeMeasurement,
  radarData,
}: {
  measurements: MeasurementProfile[]
  activeMeasurement: MeasurementProfile | undefined
  radarData: { metric: string; value: number; fullMark: number }[]
}) {
  return (
    <div className="space-y-4">
      {/* Radar Chart */}
      {activeMeasurement && radarData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Active Measurement Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {activeMeasurement.source} — Taken{" "}
              {formatDate(activeMeasurement.dateTaken)}
              {activeMeasurement.fittedBy &&
                ` by ${activeMeasurement.fittedBy}`}
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-border" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fontSize: 11 }}
                    className="fill-transparent"
                  />
                  <PolarRadiusAxis
                    tick={{ fontSize: 10 }}
                    className="fill-transparent"
                  />
                  <Radar
                    dataKey="value"
                    stroke="#4338ca"
                    fill="#4338ca"
                    fillOpacity={0.2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Measurement details grid */}
      {activeMeasurement && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Waist", value: activeMeasurement.waist },
            { label: "Seat", value: activeMeasurement.seat },
            { label: "Thigh", value: activeMeasurement.thigh },
            { label: "Knee", value: activeMeasurement.knee },
            { label: "Inseam", value: activeMeasurement.inseam },
            { label: "Outseam", value: activeMeasurement.outseam },
            { label: "Rise (Front)", value: activeMeasurement.riseFront },
            { label: "Rise (Back)", value: activeMeasurement.riseBack },
            { label: "Hip", value: activeMeasurement.hip },
            { label: "Leg Opening", value: activeMeasurement.legOpening },
            ...(activeMeasurement.calf
              ? [{ label: "Calf", value: activeMeasurement.calf }]
              : []),
            ...(activeMeasurement.ankle
              ? [{ label: "Ankle", value: activeMeasurement.ankle }]
              : []),
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="px-3 py-2.5">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-semibold">{m.value}&Prime;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Other measurement profiles */}
      {measurements.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              All Measurement Profiles ({measurements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {measurements.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between rounded-md border p-3 ${
                    m.isActive
                      ? "border-indigo-200 bg-indigo-50 dark:border-indigo-900/50 dark:bg-indigo-950/20"
                      : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      {m.source}
                      {m.isActive && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                        >
                          Active
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(m.dateTaken)}
                      {m.fittedBy && ` — ${m.fittedBy}`}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      W:{m.waist}&Prime; S:{m.seat}&Prime; I:{m.inseam}&Prime;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {measurements.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No measurement profiles on file.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Gifting Tab ─────────────────────────────────────────────
function GiftingTab({ orders }: { orders: Order[] }) {
  const giftOrders = orders.filter((o) => o.giftRecipient || o.giftNote)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Gift className="size-4" />
          Gift Orders ({giftOrders.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {giftOrders.length > 0 ? (
          <div className="space-y-3">
            {giftOrders.map((order) => (
              <div key={order.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                  >
                    {order.id}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(order.orderDate)}
                  </span>
                </div>
                {order.giftRecipient && (
                  <p className="mt-1 text-sm">
                    <span className="text-muted-foreground">To:</span>{" "}
                    {order.giftRecipient}
                  </p>
                )}
                {order.giftSender && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">From:</span>{" "}
                    {order.giftSender}
                  </p>
                )}
                {order.giftNote && (
                  <p className="mt-1 text-sm italic text-muted-foreground">
                    &ldquo;{order.giftNote}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No gift orders on record.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Preferences Tab ─────────────────────────────────────────
function PreferencesTab({
  customer,
}: {
  customer: Customer
}) {
  const c = customer

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Purchase Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preferred Purchase</span>
              <span>{c.preferredPurchase}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preferred Contact</span>
              <span>{c.preferredContact}</span>
            </div>
            {c.favoriteColor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Favorite Color</span>
                <span>{c.favoriteColor}</span>
              </div>
            )}
            {c.climate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Climate</span>
                <span>{c.climate}</span>
              </div>
            )}
            {c.normalPantsType && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Normal Pants</span>
                <span>{c.normalPantsType}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Fit & Alterations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fit Confirmed</span>
              <span>{c.hasFitConfirmation ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items Altered</span>
              <span>{c.itemsAltered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Active Alterations
              </span>
              <span>{c.activeAlterations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Returns</span>
              <span>{c.ordersReturned}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Notes Tab ───────────────────────────────────────────────
function NotesTab({
  customer,
}: {
  customer: Customer
}) {
  const c = customer

  return (
    <div className="space-y-4">
      {c.profileNote && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Profile Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{c.profileNote}</p>
          </CardContent>
        </Card>
      )}
      {c.callNotes && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Call Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{c.callNotes}</p>
          </CardContent>
        </Card>
      )}
      {!c.profileNote && !c.callNotes && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No notes on file.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
