import { create } from "zustand"
import type { Order, OrderStatus } from "@/data/types"
import { initializeMockData } from "@/data/mockData"

const PIPELINE_ORDER: OrderStatus[] = [
  "Order Received",
  "Pattern Drafting",
  "Cutting",
  "Sewing",
  "Finishing",
  "QC",
  "Shipped",
]

interface StageGroup {
  stage: OrderStatus
  orders: Order[]
  count: number
  avgDaysInStage: number
}

interface ArtisanWorkload {
  artisan: string
  activeOrders: number
}

interface PipelineMetrics {
  totalActive: number
  artisansWorking: number
  avgDaysInPipeline: number
  ordersDueThisWeek: number
}

interface ProductionState {
  orders: Order[]
}

interface ProductionActions {
  getOrdersByStage: () => StageGroup[]
  moveOrderToStage: (orderId: string, newStage: OrderStatus) => boolean
  getArtisanWorkload: () => ArtisanWorkload[]
  getPipelineMetrics: () => PipelineMetrics
}

export const useProductionStore = create<ProductionState & ProductionActions>(
  (set, get) => {
    const data = initializeMockData()

    return {
      orders: data.orders,

      getOrdersByStage: () => {
        const { orders } = get()
        const now = new Date()

        return PIPELINE_ORDER.map((stage) => {
          const stageOrders = orders.filter((o) => o.status === stage)

          // Calculate avg days in stage for current occupants
          let totalDays = 0
          for (const order of stageOrders) {
            const currentStage = order.pipelineStages.find(
              (s) => s.stage === stage && !s.exitedAt
            )
            if (currentStage) {
              const entered = new Date(currentStage.enteredAt)
              const days = Math.floor(
                (now.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)
              )
              totalDays += days
            }
          }

          return {
            stage,
            orders: stageOrders,
            count: stageOrders.length,
            avgDaysInStage:
              stageOrders.length > 0
                ? parseFloat((totalDays / stageOrders.length).toFixed(1))
                : 0,
          }
        })
      },

      moveOrderToStage: (orderId, newStage) => {
        const order = get().orders.find((o) => o.id === orderId)
        if (!order) return false

        const currentIndex = PIPELINE_ORDER.indexOf(order.status)
        const newIndex = PIPELINE_ORDER.indexOf(newStage)
        if (newIndex <= currentIndex) return false // Can't go backwards

        const now = new Date().toISOString()

        // Close current stage and add new
        const updatedStages = order.pipelineStages.map((s) =>
          s.stage === order.status && !s.exitedAt
            ? { ...s, exitedAt: now }
            : s
        )
        updatedStages.push({
          stage: newStage,
          enteredAt: now,
          exitedAt: null,
          artisan: order.assignedArtisan,
          notes: null,
        })

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: newStage,
                  pipelineStages: updatedStages,
                  completedDate:
                    newStage === "Shipped"
                      ? now.split("T")[0]
                      : o.completedDate,
                }
              : o
          ),
        }))

        return true
      },

      getArtisanWorkload: () => {
        const { orders } = get()
        const activeOrders = orders.filter(
          (o) => o.status !== "Shipped" && o.status !== "Order Received"
        )

        const workloadMap = new Map<string, number>()
        for (const order of activeOrders) {
          if (order.assignedArtisan) {
            workloadMap.set(
              order.assignedArtisan,
              (workloadMap.get(order.assignedArtisan) || 0) + 1
            )
          }
        }

        return Array.from(workloadMap.entries())
          .map(([artisan, activeOrders]) => ({ artisan, activeOrders }))
          .sort((a, b) => b.activeOrders - a.activeOrders)
      },

      getPipelineMetrics: () => {
        const { orders } = get()
        const now = new Date()
        const weekFromNow = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        )

        const activeOrders = orders.filter((o) => o.status !== "Shipped")
        const artisans = new Set(
          activeOrders
            .filter((o) => o.assignedArtisan)
            .map((o) => o.assignedArtisan)
        )

        // Avg days in pipeline for active orders
        let totalDays = 0
        for (const order of activeOrders) {
          const orderDate = new Date(order.orderDate)
          totalDays += Math.floor(
            (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
          )
        }

        const ordersDueThisWeek = activeOrders.filter((o) => {
          const promised = new Date(o.promisedDate)
          return promised <= weekFromNow && promised >= now
        }).length

        return {
          totalActive: activeOrders.length,
          artisansWorking: artisans.size,
          avgDaysInPipeline:
            activeOrders.length > 0
              ? parseFloat((totalDays / activeOrders.length).toFixed(1))
              : 0,
          ordersDueThisWeek,
        }
      },
    }
  }
)
