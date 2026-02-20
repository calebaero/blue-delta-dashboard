import { useEffect, useMemo } from "react"
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { KanbanCard } from "./KanbanCard"
import { useProductionStore } from "@/stores/useProductionStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { useProductStore } from "@/stores/useProductStore"
import type { OrderStatus, Order } from "@/data/types"

const STAGE_ORDER: OrderStatus[] = [
  "Order Received",
  "Pattern Drafting",
  "Cutting",
  "Sewing",
  "Finishing",
  "QC",
  "Shipped",
]

const STAGE_HEADER_COLORS: Record<OrderStatus, string> = {
  "Order Received": "bg-slate-200 dark:bg-slate-700",
  "Pattern Drafting": "bg-blue-200 dark:bg-blue-800",
  Cutting: "bg-cyan-200 dark:bg-cyan-800",
  Sewing: "bg-indigo-200 dark:bg-indigo-800",
  Finishing: "bg-violet-200 dark:bg-violet-800",
  QC: "bg-amber-200 dark:bg-amber-800",
  Shipped: "bg-emerald-200 dark:bg-emerald-800",
}

interface KanbanBoardProps {
  artisanFilter: string
  fabricFamilyFilter: string
}

function getDaysInStage(order: Order): number {
  const currentStage = (order.pipelineStages ?? []).find(
    (s) => s.stage === order.status && !s.exitedAt
  )
  if (!currentStage) return 0
  const entered = new Date(currentStage.enteredAt)
  const now = new Date()
  return Math.floor(
    (now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
  )
}

export function KanbanBoard({
  artisanFilter,
  fabricFamilyFilter,
}: KanbanBoardProps) {
  const getOrdersByStage = useProductionStore((s) => s.getOrdersByStage)
  const moveOrderToStage = useProductionStore((s) => s.moveOrderToStage)
  const customers = useCustomerStore((s) => s.customers)
  const fabricRolls = useInventoryStore((s) => s.fabricRolls)
  const products = useProductStore((s) => s.products)
  const fetchProductData = useProductStore((s) => s.fetchData)

  useEffect(() => {
    fetchProductData()
  }, [])

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers]
  )
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  )
  const rollMap = useMemo(
    () => new Map(fabricRolls.map((r) => [r.id, r])),
    [fabricRolls]
  )

  const stageGroups = getOrdersByStage()

  // Apply filters
  const filteredStageGroups = useMemo(() => {
    return stageGroups.map((sg) => ({
      ...sg,
      orders: sg.orders.filter((o) => {
        if (artisanFilter && artisanFilter !== "All") {
          if (o.assignedArtisan !== artisanFilter) return false
        }
        if (fabricFamilyFilter && fabricFamilyFilter !== "All") {
          const roll = o.fabricRollId ? rollMap.get(o.fabricRollId) : null
          if (!roll || roll.fabricFamily !== fabricFamilyFilter) return false
        }
        return true
      }),
    }))
  }, [stageGroups, artisanFilter, fabricFamilyFilter, rollMap])

  function handleDragEnd(result: DropResult) {
    const { draggableId, source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId) return

    const sourceStage = source.droppableId as OrderStatus
    const destStage = destination.droppableId as OrderStatus
    const sourceIdx = STAGE_ORDER.indexOf(sourceStage)
    const destIdx = STAGE_ORDER.indexOf(destStage)

    if (destIdx <= sourceIdx) {
      toast.error("Cannot move orders backward in the pipeline")
      return
    }

    const success = moveOrderToStage(draggableId, destStage)
    if (success) {
      // Find the order to get artisan name
      const order = stageGroups
        .flatMap((sg) => sg.orders)
        .find((o) => o.id === draggableId)
      const artisan = order?.assignedArtisan || "unassigned"
      toast.success(
        `Order ${draggableId} moved to ${destStage} — assigned to ${artisan}`
      )
    } else {
      toast.error("Failed to move order")
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {filteredStageGroups.map((sg) => (
          <div
            key={sg.stage}
            className="flex w-56 shrink-0 flex-col rounded-lg border bg-muted/30"
          >
            {/* Column header */}
            <div
              className={`rounded-t-lg px-3 py-2 ${STAGE_HEADER_COLORS[sg.stage]}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold">{sg.stage}</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {sg.orders.length}
                </Badge>
              </div>
              {sg.avgDaysInStage > 0 && (
                <p className="text-[10px] opacity-70">
                  Avg {sg.avgDaysInStage}d
                </p>
              )}
            </div>

            {/* Droppable area */}
            <Droppable droppableId={sg.stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 space-y-2 overflow-y-auto p-2 ${
                    snapshot.isDraggingOver ? "bg-indigo-50 dark:bg-indigo-950/20" : ""
                  }`}
                  style={{ maxHeight: "calc(100vh - 320px)", minHeight: 100 }}
                >
                  {sg.orders.map((order, index) => (
                    <Draggable
                      key={order.id}
                      draggableId={order.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={
                            snapshot.isDragging ? "opacity-90 shadow-lg" : ""
                          }
                        >
                          <KanbanCard
                            order={order}
                            customer={customerMap.get(order.customerId)}
                            product={productMap.get(order.productId)}
                            fabricRoll={
                              order.fabricRollId
                                ? rollMap.get(order.fabricRollId)
                                : undefined
                            }
                            daysInStage={getDaysInStage(order)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
