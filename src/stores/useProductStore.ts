import { create } from "zustand"
import type { Product } from "@/data/types"
import { initializeMockData } from "@/data/mockData"
import { USE_SUPABASE } from "@/lib/config"
import { fetchProducts } from "@/lib/queries"

interface ProductState {
  products: Product[]
  isLoading: boolean
  error: string | null
}

interface ProductActions {
  fetchData: () => Promise<void>
  getProductById: (id: string) => Product | undefined
}

export const useProductStore = create<ProductState & ProductActions>(
  (set, get) => {
    const data = initializeMockData()

    return {
      products: USE_SUPABASE ? [] : data.products,
      isLoading: USE_SUPABASE,
      error: null,

      fetchData: async () => {
        if (!USE_SUPABASE) {
          const mockData = initializeMockData()
          set({ products: mockData.products, isLoading: false })
          return
        }
        // Skip if already loaded to prevent re-render loops
        if (get().products.length > 0 && !get().isLoading) return
        set({ isLoading: true, error: null })
        try {
          const products = await fetchProducts()
          set({ products, isLoading: false })
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false })
        }
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id)
      },
    }
  }
)
