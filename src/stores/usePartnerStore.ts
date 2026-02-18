import { create } from "zustand"
import type { Partner, PartnerRep, Order } from "@/data/types"
import { initializeMockData } from "@/data/mockData"

interface PartnerMetrics {
  totalRevenue: number
  totalOrders: number
  activeOrders: number
  avgOrderValue: number
  avgReturnRate: number
}

interface PartnerState {
  partners: Partner[]
  partnerReps: PartnerRep[]
  selectedPartnerId: string | null
  orders: Order[]
}

interface PartnerActions {
  getPartnerById: (id: string) => Partner | undefined
  getRepsByPartner: (partnerId: string) => PartnerRep[]
  getPartnerOrders: (partnerId: string) => Order[]
  getPartnerMetrics: (partnerId: string) => PartnerMetrics
  setSelectedPartnerId: (id: string | null) => void
}

export const usePartnerStore = create<PartnerState & PartnerActions>(
  (set, get) => {
    const data = initializeMockData()

    return {
      partners: data.partners,
      partnerReps: data.partnerReps,
      selectedPartnerId: null,
      orders: data.orders,

      getPartnerById: (id) => {
        return get().partners.find((p) => p.id === id)
      },

      getRepsByPartner: (partnerId) => {
        return get().partnerReps.filter((r) => r.partnerId === partnerId)
      },

      getPartnerOrders: (partnerId) => {
        return get().orders.filter((o) => o.partnerId === partnerId)
      },

      getPartnerMetrics: (partnerId) => {
        const partnerOrders = get().orders.filter(
          (o) => o.partnerId === partnerId
        )
        const reps = get().partnerReps.filter(
          (r) => r.partnerId === partnerId
        )

        const totalRevenue = partnerOrders.reduce(
          (sum, o) => sum + o.totalPrice,
          0
        )
        const totalOrders = partnerOrders.length
        const activeOrders = partnerOrders.filter(
          (o) => o.status !== "Shipped"
        ).length
        const avgOrderValue =
          totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
        const avgReturnRate =
          reps.length > 0
            ? parseFloat(
                (
                  reps.reduce((sum, r) => sum + r.averageReturnRate, 0) /
                  reps.length
                ).toFixed(1)
              )
            : 0

        return {
          totalRevenue,
          totalOrders,
          activeOrders,
          avgOrderValue,
          avgReturnRate,
        }
      },

      setSelectedPartnerId: (id) => set({ selectedPartnerId: id }),
    }
  }
)
