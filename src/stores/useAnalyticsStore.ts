import { create } from "zustand"
import type { MonthlyMetrics } from "@/data/types"
import { initializeMockData } from "@/data/mockData"
import { USE_SUPABASE } from "@/lib/config"
import { fetchMonthlyMetrics } from "@/lib/queries"

interface AnalyticsState {
  monthlyMetrics: MonthlyMetrics[]
  isLoading: boolean
  error: string | null
}

interface AnalyticsActions {
  fetchData: () => Promise<void>
  getRevenueData: () => { month: string; revenue: number; orderCount: number }[]
  getOrderTrendData: () => {
    month: string
    orderCount: number
    newCustomers: number
  }[]
  getChannelMixData: () => {
    month: string
    dtcWeb: number
    dtcStore: number
    b2b: number
    trunkShow: number
  }[]
  getLeadTimeData: () => {
    month: string
    avgLeadTime: number
    onTimeRate: number
  }[]
  getFabricConsumptionData: () => {
    month: string
    consumed: number
    received: number
  }[]
}

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>(
  (_set, get) => {
    const data = initializeMockData()

    return {
      monthlyMetrics: USE_SUPABASE ? [] : data.monthlyMetrics,
      isLoading: USE_SUPABASE,
      error: null,

      fetchData: async () => {
        if (!USE_SUPABASE) {
          const mockData = initializeMockData()
          _set({ monthlyMetrics: mockData.monthlyMetrics, isLoading: false })
          return
        }
        _set({ isLoading: true, error: null })
        try {
          const monthlyMetrics = await fetchMonthlyMetrics()
          _set({ monthlyMetrics, isLoading: false })
        } catch (err) {
          _set({ error: (err as Error).message, isLoading: false })
        }
      },

      getRevenueData: () => {
        return get().monthlyMetrics.map((m) => ({
          month: m.month,
          revenue: m.revenue,
          orderCount: m.orderCount,
        }))
      },

      getOrderTrendData: () => {
        return get().monthlyMetrics.map((m) => ({
          month: m.month,
          orderCount: m.orderCount,
          newCustomers: m.newCustomers,
        }))
      },

      getChannelMixData: () => {
        return get().monthlyMetrics.map((m) => ({
          month: m.month,
          dtcWeb: m.dtcWebOrders,
          dtcStore: m.dtcStoreOrders,
          b2b: m.b2bOrders,
          trunkShow: m.trunkShowOrders,
        }))
      },

      getLeadTimeData: () => {
        return get().monthlyMetrics.map((m) => ({
          month: m.month,
          avgLeadTime: m.averageLeadTimeDays,
          onTimeRate: m.onTimeDeliveryRate,
        }))
      },

      getFabricConsumptionData: () => {
        return get().monthlyMetrics.map((m) => ({
          month: m.month,
          consumed: m.fabricYardsConsumed,
          received: m.fabricYardsReceived,
        }))
      },
    }
  }
)
