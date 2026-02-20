import { supabase } from "./supabase"
import type { RealtimeChannel } from "@supabase/supabase-js"

/**
 * Subscribe to Realtime changes on the orders table.
 * On any INSERT/UPDATE/DELETE, calls the provided refetch callback
 * which should re-fetch the full orders list (with pipeline_stages).
 *
 * Returns an unsubscribe function.
 */
export function subscribeToOrders(onRefetch: () => void): () => void {
  const channel: RealtimeChannel = supabase
    .channel("orders-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      () => onRefetch()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "pipeline_stages" },
      () => onRefetch()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to Realtime changes on the fabric_rolls table.
 * On any INSERT/UPDATE/DELETE, calls the provided refetch callback.
 *
 * Returns an unsubscribe function.
 */
export function subscribeToFabricRolls(onRefetch: () => void): () => void {
  const channel: RealtimeChannel = supabase
    .channel("fabric-rolls-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "fabric_rolls" },
      () => onRefetch()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
