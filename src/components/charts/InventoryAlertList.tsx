import { Link } from "react-router"
import { AlertTriangle, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface InventoryAlert {
  id: string
  name: string
  type: "fabric" | "hardware"
  currentLevel: number
  unit: string
  severity: "critical" | "warning"
}

interface InventoryAlertListProps {
  alerts: InventoryAlert[]
}

export function InventoryAlertList({ alerts }: InventoryAlertListProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="size-4 text-amber-500" />
          Inventory Alerts
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {alerts.length} items at or below reorder point
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="flex-1 space-y-2">
          {alerts.slice(0, 8).map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center gap-3 rounded-md border p-2.5 ${
                alert.severity === "critical"
                  ? "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
                  : "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20"
              }`}
            >
              <div
                className={`size-2 shrink-0 rounded-full ${
                  alert.severity === "critical"
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
              />
              <Package className="size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{alert.name}</p>
                <p className="text-xs text-muted-foreground">
                  {alert.currentLevel.toFixed(1)} {alert.unit} remaining
                </p>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              All inventory levels healthy
            </p>
          )}
        </div>
        <Link
          to="/inventory"
          className="mt-3 block text-sm font-medium text-indigo-700 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View All Inventory →
        </Link>
      </CardContent>
    </Card>
  )
}
