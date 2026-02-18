import { create } from "zustand"
import type { Customer, MeasurementProfile, LoyaltyTier, OrderChannel } from "@/data/types"
import { initializeMockData } from "@/data/mockData"

interface CustomerState {
  customers: Customer[]
  measurements: MeasurementProfile[]
  selectedCustomerId: string | null
  searchQuery: string
  tierFilter: LoyaltyTier | "All"
  channelFilter: OrderChannel | "All"
}

interface CustomerActions {
  getCustomerById: (id: string) => Customer | undefined
  getCustomerMeasurements: (customerId: string) => MeasurementProfile[]
  getActiveMeasurement: (customerId: string) => MeasurementProfile | undefined
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  setSelectedCustomerId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setTierFilter: (tier: LoyaltyTier | "All") => void
  setChannelFilter: (channel: OrderChannel | "All") => void
  getFilteredCustomers: () => Customer[]
}

export const useCustomerStore = create<CustomerState & CustomerActions>(
  (set, get) => {
    const data = initializeMockData()

    return {
      customers: data.customers,
      measurements: data.measurements,
      selectedCustomerId: null,
      searchQuery: "",
      tierFilter: "All",
      channelFilter: "All",

      getCustomerById: (id) => {
        return get().customers.find((c) => c.id === id)
      },

      getCustomerMeasurements: (customerId) => {
        return get().measurements.filter((m) => m.customerId === customerId)
      },

      getActiveMeasurement: (customerId) => {
        return get().measurements.find(
          (m) => m.customerId === customerId && m.isActive
        )
      },

      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }))
      },

      setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setTierFilter: (tier) => set({ tierFilter: tier }),
      setChannelFilter: (channel) => set({ channelFilter: channel }),

      getFilteredCustomers: () => {
        const { customers, searchQuery, tierFilter, channelFilter } = get()
        let filtered = customers

        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          filtered = filtered.filter(
            (c) =>
              c.firstName.toLowerCase().includes(q) ||
              c.lastName.toLowerCase().includes(q) ||
              c.email.toLowerCase().includes(q) ||
              c.phone.includes(q) ||
              c.id.toLowerCase().includes(q)
          )
        }

        if (tierFilter !== "All") {
          filtered = filtered.filter((c) => c.loyaltyTier === tierFilter)
        }

        if (channelFilter !== "All") {
          filtered = filtered.filter((c) => c.channel === channelFilter)
        }

        return filtered
      },
    }
  }
)
