import { Badge } from "@/components/ui/badge"
import type { OrderStatus, LoyaltyTier, ShipmentStatus } from "@/data/types"

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
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

const TIER_COLORS: Record<LoyaltyTier, string> = {
  New: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Returning:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  VIP: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Ambassador:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
}

const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  "Label Created":
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Picked Up":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "In Transit":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "Out for Delivery":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Delivered:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
}

interface StatusBadgeProps {
  status: OrderStatus | LoyaltyTier | ShipmentStatus
  type?: "order" | "tier" | "shipment"
}

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  let colorClass = ""

  if (type === "order") {
    colorClass = ORDER_STATUS_COLORS[status as OrderStatus] || ""
  } else if (type === "tier") {
    colorClass = TIER_COLORS[status as LoyaltyTier] || ""
  } else if (type === "shipment") {
    colorClass = SHIPMENT_STATUS_COLORS[status as ShipmentStatus] || ""
  }

  return (
    <Badge variant="secondary" className={`text-xs ${colorClass}`}>
      {status}
    </Badge>
  )
}
