import { create } from "zustand"
import type { Shipment } from "@/data/types"
import { initializeMockData } from "@/data/mockData"
import { USE_SUPABASE } from "@/lib/config"
import { fetchShipments } from "@/lib/queries"

interface ShippingState {
  shipments: Shipment[]
  selectedShipmentId: string | null
  isLoading: boolean
  error: string | null
}

interface ShippingActions {
  fetchData: () => Promise<void>
  getShipmentById: (id: string) => Shipment | undefined
  getShipmentByOrder: (orderId: string) => Shipment | undefined
  getActiveShipments: () => Shipment[]
  getDeliveredShipments: () => Shipment[]
  setSelectedShipmentId: (id: string | null) => void
}

export const useShippingStore = create<ShippingState & ShippingActions>(
  (set, get) => {
    const data = initializeMockData()

    return {
      shipments: USE_SUPABASE ? [] : data.shipments,
      selectedShipmentId: null,
      isLoading: USE_SUPABASE,
      error: null,

      fetchData: async () => {
        if (!USE_SUPABASE) {
          const mockData = initializeMockData()
          set({ shipments: mockData.shipments, isLoading: false })
          return
        }
        set({ isLoading: true, error: null })
        try {
          const shipments = await fetchShipments()
          set({ shipments, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      getShipmentById: (id) => {
        return get().shipments.find((s) => s.id === id)
      },

      getShipmentByOrder: (orderId) => {
        return get().shipments.find((s) => s.orderId === orderId)
      },

      getActiveShipments: () => {
        return get().shipments.filter((s) => s.status !== "Delivered")
      },

      getDeliveredShipments: () => {
        return get().shipments.filter((s) => s.status === "Delivered")
      },

      setSelectedShipmentId: (id) => set({ selectedShipmentId: id }),
    }
  }
)
