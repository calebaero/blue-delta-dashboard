import { Link } from "react-router"
import { StickyNote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Order, Customer, Product, FabricRoll } from "@/data/types"

interface KanbanCardProps {
  order: Order
  customer: Customer | undefined
  product: Product | undefined
  fabricRoll: FabricRoll | undefined
  daysInStage: number
}

export function KanbanCard({
  order,
  customer,
  product,
  fabricRoll,
  daysInStage,
}: KanbanCardProps) {
  const daysBadgeColor =
    daysInStage > 5
      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      : daysInStage >= 3
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"

  const artisanInitials = order.assignedArtisan
    ? order.assignedArtisan
        .split(" ")
        .map((n) => n[0])
        .join("")
    : null

  return (
    <Card className="cursor-grab active:cursor-grabbing">
      <CardContent className="space-y-2 p-3">
        {/* Top row: Order # + days badge */}
        <div className="flex items-center justify-between">
          <Link
            to={`/orders/${order.id}`}
            className="text-sm font-semibold text-indigo-700 hover:underline dark:text-indigo-400"
            onClick={(e) => e.stopPropagation()}
          >
            {order.id}
          </Link>
          <Badge variant="secondary" className={`text-[10px] ${daysBadgeColor}`}>
            {daysInStage}d
          </Badge>
        </div>

        {/* Customer name */}
        {customer && (
          <p className="truncate text-xs text-muted-foreground">
            {customer.firstName} {customer.lastName}
          </p>
        )}

        {/* Product + Fabric row */}
        <div className="flex items-center gap-2">
          {product && (
            <Badge variant="outline" className="text-[10px]">
              {product.category}
            </Badge>
          )}
          {fabricRoll && (
            <div className="flex items-center gap-1">
              <div
                className="size-2 rounded-full"
                style={{
                  backgroundColor:
                    fabricRoll.color.toLowerCase().includes("indigo")
                      ? "#3b4ba3"
                      : fabricRoll.color.toLowerCase().includes("black")
                        ? "#1a1a1a"
                        : fabricRoll.color.toLowerCase().includes("khaki")
                          ? "#c3b091"
                          : fabricRoll.color.toLowerCase().includes("olive")
                            ? "#556b2f"
                            : fabricRoll.color.toLowerCase().includes("grey") ||
                                fabricRoll.color.toLowerCase().includes("gray")
                              ? "#808080"
                              : fabricRoll.color.toLowerCase().includes("navy")
                                ? "#001f3f"
                                : fabricRoll.color.toLowerCase().includes("white")
                                  ? "#e5e5e5"
                                  : "#6b7280",
                }}
              />
              <span className="truncate text-[10px] text-muted-foreground">
                {fabricRoll.color}
              </span>
            </div>
          )}
        </div>

        {/* Artisan + note icon */}
        <div className="flex items-center justify-between">
          {order.assignedArtisan ? (
            <div className="flex items-center gap-1.5">
              <Avatar className="size-5">
                <AvatarFallback className="text-[8px] bg-slate-200 dark:bg-slate-700">
                  {artisanInitials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-[11px] text-muted-foreground">
                {order.assignedArtisan}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground">Unassigned</span>
          )}
          {order.orderNote && (
            <StickyNote className="size-3 text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
