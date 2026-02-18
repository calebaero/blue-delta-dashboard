import { create } from "zustand"
import type { Shipment } from "@/data/types"
import { initializeMockData } from "@/data/mockData"

interface ShippingState {
  shipments: Shipment[]
  selectedShipmentId: string | null
}

interface ShippingActions {
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
      shipments: data.shipments,
      selectedShipmentId: null,

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
