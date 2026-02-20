import { useEffect } from "react"

/**
 * Calls fetchData() on mount for one or more Zustand stores.
 * Each store must expose: fetchData, isLoading, error.
 */
export function useStoreData(
  ...stores: { fetchData: () => Promise<void> }[]
) {
  useEffect(() => {
    for (const store of stores) {
      store.fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
