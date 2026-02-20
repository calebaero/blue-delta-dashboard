import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Search, Truck, Package } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PageLoadingState } from "@/components/shared/PageLoadingState"
import { useShippingStore } from "@/stores/useShippingStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import type { Shipment, ShipmentStatus } from "@/data/types"

const ALL_STATUSES: ShipmentStatus[] = [
  "Label Created",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered",
]

const CARRIERS = ["UPS", "FedEx", "USPS"]

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

interface ShipmentRow extends Shipment {
  customerName: string
}

export default function ShippingPage() {
  const shipments = useShippingStore((s) => s.shipments)
  const customers = useCustomerStore((s) => s.customers)
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus[]>([])
  const [carrierFilter, setCarrierFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchShippingData = useShippingStore((s) => s.fetchData)
  const fetchCustomerData = useCustomerStore((s) => s.fetchData)
  const shippingLoading = useShippingStore((s) => s.isLoading)
  const customerLoading = useCustomerStore((s) => s.isLoading)
  const shippingError = useShippingStore((s) => s.error)
  const customerError = useCustomerStore((s) => s.error)
  const isLoading = shippingLoading || customerLoading
  const error = shippingError || customerError

  useEffect(() => {
    fetchShippingData()
    fetchCustomerData()
  }, [])

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )

  const stats = useMemo(() => {
    const inTransit = shipments.filter((s) => s.status !== "Delivered").length
    const delivered = shipments.filter((s) => s.status === "Delivered").length
    const deliveredShipments = shipments.filter(
      (s) => s.status === "Delivered" && s.actualDelivery
    )
    let avgDays = 0
    if (deliveredShipments.length > 0) {
      const totalDays = deliveredShipments.reduce((sum, s) => {
        const shipped = new Date(s.shippedDate)
        const del = new Date(s.actualDelivery!)
        return (
          sum +
          Math.floor(
            (del.getTime() - shipped.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      }, 0)
      avgDays = parseFloat((totalDays / deliveredShipments.length).toFixed(1))
    }
    let onTimeRate = 0
    if (deliveredShipments.length > 0) {
      const onTime = deliveredShipments.filter(
        (s) => s.actualDelivery! <= s.estimatedDelivery
      ).length
      onTimeRate = parseFloat(
        ((onTime / deliveredShipments.length) * 100).toFixed(1)
      )
    }
    return { inTransit, delivered, avgDays, onTimeRate }
  }, [shipments])

  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      if (statusFilter.length > 0 && !statusFilter.includes(s.status))
        return false
      if (carrierFilter !== "All" && s.carrier !== carrierFilter) return false
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        const customer = customerMap.get(s.customerId)
        const customerName = customer
          ? `${customer.firstName} ${customer.lastName}`.toLowerCase()
          : ""
        if (
          !s.trackingNumber.toLowerCase().includes(search) &&
          !customerName.includes(search) &&
          !s.id.toLowerCase().includes(search)
        )
          return false
      }
      return true
    })
  }, [shipments, statusFilter, carrierFilter, searchQuery, customerMap])

  const rows: ShipmentRow[] = useMemo(
    () =>
      filteredShipments.map((s) => {
        const customer = customerMap.get(s.customerId)
        return {
          ...s,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Unknown",
        }
      }),
    [filteredShipments, customerMap]
  )

  const columns: ColumnDef<ShipmentRow>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Shipment ID",
        cell: ({ row }) => (
          <Link
            to={`/shipping/${row.original.id}`}
            className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "orderId",
        header: "Order #",
        cell: ({ row }) => (
          <Link
            to={`/orders/${row.original.orderId}`}
            className="text-sm text-indigo-700 hover:underline dark:text-indigo-400"
          >
            {row.original.orderId}
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
        accessorKey: "carrier",
        header: "Carrier",
        cell: ({ row }) => {
          const carrier = row.original.carrier
          const icon =
            carrier === "UPS" ? (
              <Package className="size-3 text-amber-700" />
            ) : carrier === "FedEx" ? (
              <Truck className="size-3 text-violet-600" />
            ) : (
              <Package className="size-3 text-blue-600" />
            )
          return (
            <div className="flex items-center gap-1.5">
              {icon}
              <span className="text-sm">{carrier}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "trackingNumber",
        header: "Tracking #",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.trackingNumber}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} type="shipment" />
        ),
      },
      {
        accessorKey: "shippedDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Shipped
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.shippedDate)}
          </span>
        ),
      },
      {
        accessorKey: "estimatedDelivery",
        header: "Est. Delivery",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.estimatedDelivery)}
          </span>
        ),
      },
      {
        accessorKey: "actualDelivery",
        header: "Actual Delivery",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.actualDelivery
              ? formatDate(row.original.actualDelivery)
              : "—"}
          </span>
        ),
      },
    ],
    []
  )

  function toggleStatus(status: ShipmentStatus) {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status))
    } else {
      setStatusFilter([...statusFilter, status])
    }
  }

  return (
    <PageContainer title="Shipping & Fulfillment">
      <PageLoadingState isLoading={isLoading} error={error}>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.inTransit}</p>
              <p className="text-xs text-muted-foreground">In Transit</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.delivered}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.avgDays}d</p>
              <p className="text-xs text-muted-foreground">Avg Delivery Time</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.onTimeRate}%</p>
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => {
            const isActive = statusFilter.includes(status)
            return (
              <Badge
                key={status}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer select-none ${
                  isActive
                    ? "bg-indigo-700 text-white hover:bg-indigo-800"
                    : "hover:bg-muted"
                }`}
                onClick={() => toggleStatus(status)}
              >
                {status}
              </Badge>
            )
          })}
          {statusFilter.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => setStatusFilter([])}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Search + carrier filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search tracking # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={carrierFilter} onValueChange={setCarrierFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Carriers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Carriers</SelectItem>
              {CARRIERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={rows} pageSize={20} />
      </div>
      </PageLoadingState>
    </PageContainer>
  )
}
