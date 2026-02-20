import { create } from "zustand"
import type { FabricRoll, HardwareItem } from "@/data/types"
import { initializeMockData } from "@/data/mockData"
import { USE_SUPABASE } from "@/lib/config"
import { fetchFabricRolls, fetchHardwareItems } from "@/lib/queries"
import { subscribeToFabricRolls } from "@/lib/realtime"

interface InventoryAlert {
  id: string
  name: string
  type: "fabric" | "hardware"
  currentLevel: number
  reorderPoint: number
  unit: string
  severity: "critical" | "warning"
}

interface InventoryState {
  fabricRolls: FabricRoll[]
  hardware: HardwareItem[]
  selectedRollId: string | null
  isLoading: boolean
  error: string | null
}

interface InventoryActions {
  fetchData: () => Promise<void>
  subscribeRealtime: () => () => void
  getRollById: (id: string) => FabricRoll | undefined
  deductYardage: (rollId: string, yards: number) => boolean
  getLowStockRolls: () => FabricRoll[]
  getLowStockHardware: () => HardwareItem[]
  getInventoryAlerts: () => InventoryAlert[]
  setSelectedRollId: (id: string | null) => void
}

export const useInventoryStore = create<InventoryState & InventoryActions>(
  (set, get) => {
    const data = initializeMockData()

    return {
      fabricRolls: USE_SUPABASE ? [] : data.fabricRolls,
      hardware: USE_SUPABASE ? [] : data.hardware,
      selectedRollId: null,
      isLoading: USE_SUPABASE,
      error: null,

      fetchData: async () => {
        if (!USE_SUPABASE) {
          const mockData = initializeMockData()
          set({ fabricRolls: mockData.fabricRolls, hardware: mockData.hardware, isLoading: false })
          return
        }
        set({ isLoading: true, error: null })
        try {
          const [fabricRolls, hardware] = await Promise.all([
            fetchFabricRolls(),
            fetchHardwareItems(),
          ])
          set({ fabricRolls, hardware, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      subscribeRealtime: () => {
        if (!USE_SUPABASE) return () => {}
        return subscribeToFabricRolls(() => {
          fetchFabricRolls()
            .then((fabricRolls) => set({ fabricRolls }))
            .catch(console.error)
        })
      },

      getRollById: (id) => {
        return get().fabricRolls.find((r) => r.id === id)
      },

      deductYardage: (rollId, yards) => {
        const roll = get().fabricRolls.find((r) => r.id === rollId)
        if (!roll || roll.currentYards < yards) return false

        set((state) => ({
          fabricRolls: state.fabricRolls.map((r) => {
            if (r.id !== rollId) return r
            const newYards = parseFloat((r.currentYards - yards).toFixed(1))
            let status = r.status
            if (r.status !== "Quarantine") {
              if (newYards <= 3) status = "Depleted"
              else if (newYards <= r.reorderPointYards) status = "Low"
              else status = "Active"
            }
            return { ...r, currentYards: newYards, status }
          }),
        }))

        return true
      },

      getLowStockRolls: () => {
        return get().fabricRolls.filter(
          (r) => r.status === "Low" || r.status === "Depleted"
        )
      },

      getLowStockHardware: () => {
        return get().hardware.filter(
          (h) => h.status === "Low" || h.status === "Out of Stock"
        )
      },

      getInventoryAlerts: () => {
        const { fabricRolls, hardware } = get()
        const alerts: InventoryAlert[] = []

        for (const roll of fabricRolls) {
          if (roll.status === "Depleted" || roll.status === "Low") {
            const pct = roll.currentYards / roll.initialYards
            alerts.push({
              id: roll.id,
              name: `${roll.color} ${roll.fabricFamily}`,
              type: "fabric",
              currentLevel: roll.currentYards,
              reorderPoint: roll.reorderPointYards,
              unit: "yards",
              severity: pct < 0.25 ? "critical" : "warning",
            })
          }
        }

        for (const item of hardware) {
          if (item.status === "Low" || item.status === "Out of Stock") {
            alerts.push({
              id: item.id,
              name: item.name,
              type: "hardware",
              currentLevel: item.currentStock,
              reorderPoint: item.reorderPoint,
              unit: "units",
              severity: item.status === "Out of Stock" ? "critical" : "warning",
            })
          }
        }

        // Sort: critical first
        alerts.sort((a, b) => {
          if (a.severity === "critical" && b.severity !== "critical") return -1
          if (a.severity !== "critical" && b.severity === "critical") return 1
          return 0
        })

        return alerts
      },

      setSelectedRollId: (id) => set({ selectedRollId: id }),
    }
  }
)
