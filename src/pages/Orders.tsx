import { useMemo } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Search } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
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
import { useOrderStore } from "@/stores/useOrderStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { initializeMockData } from "@/data/mockData"
import type { Order, OrderStatus, OrderChannel } from "@/data/types"

const ALL_STATUSES: OrderStatus[] = [
  "Order Received",
  "Pattern Drafting",
  "Cutting",
  "Sewing",
  "Finishing",
  "QC",
  "Shipped",
]

const CHANNELS: OrderChannel[] = [
  "DTC Web",
  "DTC Store",
  "B2B Tom James",
  "B2B Other",
  "Trunk Show",
]

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

export default function OrdersPage() {
  const orders = useOrderStore((s) => s.orders)
  const statusFilter = useOrderStore((s) => s.statusFilter)
  const channelFilter = useOrderStore((s) => s.channelFilter)
  const searchQuery = useOrderStore((s) => s.searchQuery)
  const setStatusFilter = useOrderStore((s) => s.setStatusFilter)
  const setChannelFilter = useOrderStore((s) => s.setChannelFilter)
  const setSearchQuery = useOrderStore((s) => s.setSearchQuery)
  const customers = useCustomerStore((s) => s.customers)

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )

  const { products } = initializeMockData()
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter.length > 0 && !statusFilter.includes(o.status))
        return false
      if (channelFilter !== "All" && o.channel !== channelFilter) return false
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        const customer = customerMap.get(o.customerId)
        const customerName = customer
          ? `${customer.firstName} ${customer.lastName}`.toLowerCase()
          : ""
        if (
          !o.id.toLowerCase().includes(search) &&
          !customerName.includes(search)
        )
          return false
      }
      return true
    })
  }, [orders, statusFilter, channelFilter, searchQuery, customerMap])

  const columns: ColumnDef<Order>[] = useMemo(
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
        accessorKey: "customerId",
        header: "Customer",
        cell: ({ row }) => {
          const customer = customerMap.get(row.original.customerId)
          if (!customer) return <span className="text-sm">Unknown</span>
          return (
            <Link
              to={`/customers/${customer.id}`}
              className="text-sm hover:underline"
            >
              {customer.firstName} {customer.lastName}
            </Link>
          )
        },
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
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Total
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.totalPrice)}
          </span>
        ),
      },
      {
        accessorKey: "orderDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Date
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
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
    [customerMap, productMap]
  )

  function toggleStatus(status: OrderStatus) {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter((s) => s !== status))
    } else {
      setStatusFilter([...statusFilter, status])
    }
  }

  // Counts per status for pills
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of ALL_STATUSES) {
      counts[s] = orders.filter((o) => o.status === s).length
    }
    return counts
  }, [orders])

  return (
    <PageContainer title="Orders">
      <div className="space-y-4">
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
                {status} ({statusCounts[status]})
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

        {/* Search + Channel filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by order # or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={channelFilter}
            onValueChange={(v) => setChannelFilter(v as OrderChannel | "All")}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Channels</SelectItem>
              {CHANNELS.map((ch) => (
                <SelectItem key={ch} value={ch}>
                  {ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={filteredOrders} pageSize={20} />
      </div>
    </PageContainer>
  )
}
