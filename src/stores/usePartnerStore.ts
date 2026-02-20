import { create } from "zustand"
import type { Partner, PartnerRep, Order } from "@/data/types"
import { initializeMockData } from "@/data/mockData"
import { USE_SUPABASE } from "@/lib/config"
import { fetchPartners, fetchPartnerReps, fetchOrders } from "@/lib/queries"

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
  isLoading: boolean
  error: string | null
}

interface PartnerActions {
  fetchData: () => Promise<void>
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
      partners: USE_SUPABASE ? [] : data.partners,
      partnerReps: USE_SUPABASE ? [] : data.partnerReps,
      selectedPartnerId: null,
      orders: USE_SUPABASE ? [] : data.orders,
      isLoading: USE_SUPABASE,
      error: null,

      fetchData: async () => {
        if (!USE_SUPABASE) {
          const mockData = initializeMockData()
          set({
            partners: mockData.partners,
            partnerReps: mockData.partnerReps,
            orders: mockData.orders,
            isLoading: false,
          })
          return
        }
        set({ isLoading: true, error: null })
        try {
          const [partners, partnerReps, orders] = await Promise.all([
            fetchPartners(),
            fetchPartnerReps(),
            fetchOrders(),
          ])
          set({ partners, partnerReps, orders, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

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
