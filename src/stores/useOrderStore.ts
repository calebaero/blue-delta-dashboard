import { create } from "zustand"
import type { Order, OrderStatus, OrderChannel } from "@/data/types"
import { initializeMockData } from "@/data/mockData"
import { USE_SUPABASE } from "@/lib/config"
import { fetchOrders, advanceOrderStage as advanceOrderStageApi } from "@/lib/queries"

const PIPELINE_ORDER: OrderStatus[] = [
  "Order Received",
  "Pattern Drafting",
  "Cutting",
  "Sewing",
  "Finishing",
  "QC",
  "Shipped",
]

interface OrderState {
  orders: Order[]
  selectedOrderId: string | null
  statusFilter: OrderStatus[]
  channelFilter: OrderChannel | "All"
  dateRange: { from: string | null; to: string | null }
  searchQuery: string
  isLoading: boolean
  error: string | null
}

interface OrderActions {
  fetchData: () => Promise<void>
  getOrderById: (id: string) => Order | undefined
  getOrdersByCustomer: (customerId: string) => Order[]
  getOrdersByPartner: (partnerId: string) => Order[]
  advanceOrderStage: (orderId: string) => boolean
  setSelectedOrderId: (id: string | null) => void
  setStatusFilter: (statuses: OrderStatus[]) => void
  setChannelFilter: (channel: OrderChannel | "All") => void
  setDateRange: (range: { from: string | null; to: string | null }) => void
  setSearchQuery: (query: string) => void
  getFilteredOrders: () => Order[]
}

export const useOrderStore = create<OrderState & OrderActions>((set, get) => {
  const data = initializeMockData()

  return {
    orders: USE_SUPABASE ? [] : data.orders,
    selectedOrderId: null,
    statusFilter: [],
    channelFilter: "All",
    dateRange: { from: null, to: null },
    searchQuery: "",
    isLoading: USE_SUPABASE,
    error: null,

    fetchData: async () => {
      if (!USE_SUPABASE) {
        const mockData = initializeMockData()
        set({ orders: mockData.orders, isLoading: false })
        return
      }
      set({ isLoading: true, error: null })
      try {
        const orders = await fetchOrders()
        set({ orders, isLoading: false })
      } catch (err) {
        set({ error: (err as Error).message, isLoading: false })
      }
    },

    getOrderById: (id) => {
      return get().orders.find((o) => o.id === id)
    },

    getOrdersByCustomer: (customerId) => {
      return get().orders.filter((o) => o.customerId === customerId)
    },

    getOrdersByPartner: (partnerId) => {
      return get().orders.filter((o) => o.partnerId === partnerId)
    },

    advanceOrderStage: (orderId) => {
      const order = get().orders.find((o) => o.id === orderId)
      if (!order) return false

      const currentIndex = PIPELINE_ORDER.indexOf(order.status)
      if (currentIndex >= PIPELINE_ORDER.length - 1) return false

      const nextStatus = PIPELINE_ORDER[currentIndex + 1]
      const now = new Date().toISOString()

      // Close current stage
      const updatedStages = order.pipelineStages.map((s) =>
        s.stage === order.status && !s.exitedAt
          ? { ...s, exitedAt: now }
          : s
      )

      // Add new stage
      updatedStages.push({
        stage: nextStatus,
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
                status: nextStatus,
                pipelineStages: updatedStages,
                completedDate:
                  nextStatus === "Shipped" ? now.split("T")[0] : o.completedDate,
              }
            : o
        ),
      }))

      // Fire-and-forget Supabase update
      if (USE_SUPABASE) {
        advanceOrderStageApi(
          orderId,
          order.status,
          nextStatus,
          order.assignedArtisan
        ).catch(console.error)
      }

      return true
    },

    setSelectedOrderId: (id) => set({ selectedOrderId: id }),
    setStatusFilter: (statuses) => set({ statusFilter: statuses }),
    setChannelFilter: (channel) => set({ channelFilter: channel }),
    setDateRange: (range) => set({ dateRange: range }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    getFilteredOrders: () => {
      const { orders, statusFilter, channelFilter, dateRange, searchQuery } =
        get()
      let filtered = orders

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (o) =>
            o.id.toLowerCase().includes(q) ||
            o.customerId.toLowerCase().includes(q)
        )
      }

      if (statusFilter.length > 0) {
        filtered = filtered.filter((o) => statusFilter.includes(o.status))
      }

      if (channelFilter !== "All") {
        filtered = filtered.filter((o) => o.channel === channelFilter)
      }

      if (dateRange.from) {
        filtered = filtered.filter((o) => o.orderDate >= dateRange.from!)
      }
      if (dateRange.to) {
        filtered = filtered.filter((o) => o.orderDate <= dateRange.to!)
      }

      return filtered
    },
  }
})
