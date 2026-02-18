import { useMemo } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Search } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useCustomerStore } from "@/stores/useCustomerStore"
import type { Customer, LoyaltyTier, OrderChannel } from "@/data/types"

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date("2026-02-15")
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
  return `${Math.floor(diffDays / 365)}y ago`
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const customer = row.original
      const initials = `${customer.firstName[0]}${customer.lastName[0]}`
      return (
        <Link
          to={`/customers/${customer.id}`}
          className="flex items-center gap-3 hover:underline"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{customer.email}</p>
          </div>
        </Link>
      )
    },
    filterFn: (row, _columnId, filterValue: string) => {
      const customer = row.original
      const fullName =
        `${customer.firstName} ${customer.lastName}`.toLowerCase()
      const email = customer.email.toLowerCase()
      const search = filterValue.toLowerCase()
      return fullName.includes(search) || email.includes(search)
    },
  },
  {
    accessorKey: "loyaltyTier",
    header: "Tier",
    cell: ({ row }) => (
      <StatusBadge status={row.original.loyaltyTier} type="tier" />
    ),
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "All") return true
      return row.original.loyaltyTier === filterValue
    },
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.channel}
      </span>
    ),
    filterFn: (row, _columnId, filterValue: string) => {
      if (filterValue === "All") return true
      return row.original.channel === filterValue
    },
  },
  {
    accessorKey: "totalOrders",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Orders
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.totalOrders}</span>
    ),
  },
  {
    accessorKey: "totalSpent",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Spent
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {formatCurrency(row.original.totalSpent)}
      </span>
    ),
  },
  {
    accessorKey: "lastOrderDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3 h-8 text-xs"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Order
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatRelativeDate(row.original.lastOrderDate)}
      </span>
    ),
  },
  {
    accessorKey: "shippingAddress.city",
    accessorFn: (row) =>
      `${row.shippingAddress.city}, ${row.shippingAddress.state}`,
    header: "Location",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.shippingAddress.city},{" "}
        {row.original.shippingAddress.state}
      </span>
    ),
  },
]

const TIERS: LoyaltyTier[] = ["New", "Returning", "VIP", "Ambassador"]
const CHANNELS: OrderChannel[] = [
  "DTC Web",
  "DTC Store",
  "B2B Tom James",
  "B2B Other",
  "Trunk Show",
]

export default function CustomersPage() {
  const customers = useCustomerStore((s) => s.customers)
  const searchQuery = useCustomerStore((s) => s.searchQuery)
  const tierFilter = useCustomerStore((s) => s.tierFilter)
  const channelFilter = useCustomerStore((s) => s.channelFilter)
  const setSearchQuery = useCustomerStore((s) => s.setSearchQuery)
  const setTierFilter = useCustomerStore((s) => s.setTierFilter)
  const setChannelFilter = useCustomerStore((s) => s.setChannelFilter)

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (tierFilter !== "All" && c.loyaltyTier !== tierFilter) return false
      if (channelFilter !== "All" && c.channel !== channelFilter) return false
      if (searchQuery) {
        const search = searchQuery.toLowerCase()
        const name = `${c.firstName} ${c.lastName}`.toLowerCase()
        const email = c.email.toLowerCase()
        if (!name.includes(search) && !email.includes(search)) return false
      }
      return true
    })
  }, [customers, tierFilter, channelFilter, searchQuery])

  return (
    <PageContainer title="Customers">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={tierFilter}
            onValueChange={(v) => setTierFilter(v as LoyaltyTier | "All")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Tiers</SelectItem>
              {TIERS.map((tier) => (
                <SelectItem key={tier} value={tier}>
                  {tier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <DataTable columns={columns} data={filteredCustomers} pageSize={20} />
      </div>
    </PageContainer>
  )
}
