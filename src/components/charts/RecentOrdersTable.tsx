import { Link } from "react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Order, OrderStatus, Customer, Product } from "@/data/types"

interface RecentOrdersTableProps {
  orders: Order[]
  customers: Customer[]
  products: Product[]
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  "Order Received":
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Pattern Drafting":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Cutting:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  Sewing:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Finishing:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  QC: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Shipped:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

export function RecentOrdersTable({
  orders,
  customers,
  products,
}: RecentOrdersTableProps) {
  const customerMap = new Map(customers.map((c) => [c.id, c]))
  const productMap = new Map(products.map((p) => [p.id, p]))

  const recentOrders = [...orders]
    .sort((a, b) => b.orderDate.localeCompare(a.orderDate))
    .slice(0, 10)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest 10 orders placed
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 text-xs">Order #</TableHead>
              <TableHead className="h-8 text-xs">Customer</TableHead>
              <TableHead className="h-8 text-xs">Product</TableHead>
              <TableHead className="h-8 text-xs">Status</TableHead>
              <TableHead className="h-8 text-right text-xs">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => {
              const customer = customerMap.get(order.customerId)
              const product = productMap.get(order.productId)
              return (
                <TableRow key={order.id}>
                  <TableCell className="py-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                      {order.id}
                    </Link>
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    {customer
                      ? `${customer.firstName} ${customer.lastName}`
                      : "Unknown"}
                  </TableCell>
                  <TableCell className="py-2 text-sm text-muted-foreground">
                    {product?.name ?? "Unknown"}
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${STATUS_COLORS[order.status]}`}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-right text-sm text-muted-foreground">
                    {formatDate(order.orderDate)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        <Link
          to="/orders"
          className="mt-3 block text-sm font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View All Orders →
        </Link>
      </CardContent>
    </Card>
  )
}
