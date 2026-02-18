import { useMemo } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { DataTable } from "@/components/shared/DataTable"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCustomerStore } from "@/stores/useCustomerStore"
import type { MeasurementProfile } from "@/data/types"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

interface MeasurementRow extends MeasurementProfile {
  customerName: string
}

export default function MeasurementsPage() {
  const customers = useCustomerStore((s) => s.customers)
  const measurements = useCustomerStore((s) => s.measurements)

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )

  const stats = useMemo(() => {
    const totalProfiles = measurements.length
    const activeProfiles = measurements.filter((m) => m.isActive).length
    const uniqueCustomers = new Set(measurements.map((m) => m.customerId)).size

    const sourceCounts: Record<string, number> = {}
    for (const m of measurements) {
      sourceCounts[m.source] = (sourceCounts[m.source] || 0) + 1
    }
    const topSource = Object.entries(sourceCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]

    const avgWaist =
      totalProfiles > 0
        ? measurements.reduce((sum, m) => sum + m.waist, 0) / totalProfiles
        : 0
    const avgInseam =
      totalProfiles > 0
        ? measurements.reduce((sum, m) => sum + m.inseam, 0) / totalProfiles
        : 0

    return {
      totalProfiles,
      activeProfiles,
      uniqueCustomers,
      topSource: topSource ? `${topSource[0]} (${topSource[1]})` : "N/A",
      avgWaist: avgWaist.toFixed(1),
      avgInseam: avgInseam.toFixed(1),
    }
  }, [measurements])

  const rows: MeasurementRow[] = useMemo(
    () =>
      measurements.map((m) => {
        const customer = customerMap.get(m.customerId)
        return {
          ...m,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : "Unknown",
        }
      }),
    [measurements, customerMap]
  )

  const columns: ColumnDef<MeasurementRow>[] = useMemo(
    () => [
      {
        accessorKey: "customerName",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Customer
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => {
          const m = row.original
          return (
            <Link
              to={`/customers/${m.customerId}`}
              className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
            >
              {m.customerName}
            </Link>
          )
        },
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.source}
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge
              variant="secondary"
              className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
            >
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Archived
            </Badge>
          ),
      },
      {
        accessorKey: "waist",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Waist
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.waist}&Prime;</span>
        ),
      },
      {
        accessorKey: "seat",
        header: "Seat",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.seat}&Prime;</span>
        ),
      },
      {
        accessorKey: "inseam",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 text-xs"
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }
          >
            Inseam
            <ArrowUpDown className="ml-1 size-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.inseam}&Prime;</span>
        ),
      },
      {
        accessorKey: "hip",
        header: "Hip",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.hip}&Prime;</span>
        ),
      },
      {
        accessorKey: "dateTaken",
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
            {formatDate(row.original.dateTaken)}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <PageContainer title="Measurement Profiles">
      <div className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.totalProfiles}</p>
              <p className="text-xs text-muted-foreground">Total Profiles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.activeProfiles}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.uniqueCustomers}</p>
              <p className="text-xs text-muted-foreground">Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-sm font-semibold">{stats.topSource}</p>
              <p className="text-xs text-muted-foreground">Top Source</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.avgWaist}&Prime;</p>
              <p className="text-xs text-muted-foreground">Avg Waist</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.avgInseam}&Prime;</p>
              <p className="text-xs text-muted-foreground">Avg Inseam</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <DataTable columns={columns} data={rows} pageSize={20} />
      </div>
    </PageContainer>
  )
}
