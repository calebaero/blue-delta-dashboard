import { supabase } from "./supabase"
import type {
  Customer,
  MeasurementProfile,
  Product,
  FabricRoll,
  HardwareItem,
  Order,
  Shipment,
  Partner,
  PartnerRep,
  MonthlyMetrics,
} from "@/data/types"
import {
  mapCustomer,
  mapMeasurementProfile,
  mapProduct,
  mapFabricRoll,
  mapHardwareItem,
  mapOrder,
  mapShipment,
  mapPartner,
  mapPartnerRep,
  mapMonthlyMetrics,
} from "./mappers"

// ── Customers ──────────────────────────────────────────────────

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapCustomer)
}

export async function fetchCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data ? mapCustomer(data) : null
}

export async function fetchMeasurementsByCustomer(
  customerId: string
): Promise<MeasurementProfile[]> {
  const { data, error } = await supabase
    .from("measurement_profiles")
    .select("*")
    .eq("customer_id", customerId)
    .order("date_taken", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapMeasurementProfile)
}

export async function fetchAllMeasurements(): Promise<MeasurementProfile[]> {
  const { data, error } = await supabase
    .from("measurement_profiles")
    .select("*")
    .order("date_taken", { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapMeasurementProfile)
}

// ── Orders ─────────────────────────────────────────────────────

export async function fetchOrders(): Promise<Order[]> {
  const { data: orderRows, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .order("order_date", { ascending: false })
  if (orderError) throw orderError

  const orderIds = (orderRows ?? []).map((o) => o.id)
  const { data: stageRows, error: stageError } = await supabase
    .from("pipeline_stages")
    .select("*")
    .in("order_id", orderIds)
    .order("entered_at", { ascending: true })
  if (stageError) throw stageError

  const stagesByOrder = new Map<string, typeof stageRows>()
  for (const s of stageRows ?? []) {
    const arr = stagesByOrder.get(s.order_id) ?? []
    arr.push(s)
    stagesByOrder.set(s.order_id, arr)
  }

  return (orderRows ?? []).map((row) =>
    mapOrder(row, stagesByOrder.get(row.id) ?? [])
  )
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data: row, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  if (!row) return null

  const { data: stages } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("order_id", id)
    .order("entered_at", { ascending: true })

  return mapOrder(row, stages ?? [])
}

export async function advanceOrderStage(
  orderId: string,
  currentStatus: string,
  newStatus: string,
  artisan: string | null
): Promise<void> {
  const now = new Date().toISOString()

  // Close current pipeline stage
  const { error: closeError } = await supabase
    .from("pipeline_stages")
    .update({ exited_at: now })
    .eq("order_id", orderId)
    .eq("stage", currentStatus)
    .is("exited_at", null)
  if (closeError) throw closeError

  // Insert new pipeline stage
  const { error: insertError } = await supabase
    .from("pipeline_stages")
    .insert({
      order_id: orderId,
      stage: newStatus,
      entered_at: now,
      artisan,
    })
  if (insertError) throw insertError

  // Update order status
  const updates: Record<string, unknown> = { status: newStatus }
  if (newStatus === "Shipped") {
    updates.completed_date = now.split("T")[0]
  }
  const { error: updateError } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
  if (updateError) throw updateError
}

// ── Inventory ──────────────────────────────────────────────────

export async function fetchFabricRolls(): Promise<FabricRoll[]> {
  const { data, error } = await supabase
    .from("fabric_rolls")
    .select("*")
    .order("status", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapFabricRoll)
}

export async function fetchHardwareItems(): Promise<HardwareItem[]> {
  const { data, error } = await supabase.from("hardware_items").select("*")
  if (error) throw error
  return (data ?? []).map(mapHardwareItem)
}

// ── Shipping ───────────────────────────────────────────────────

export async function fetchShipments(): Promise<Shipment[]> {
  const { data: shipmentRows, error: shipError } = await supabase
    .from("shipments")
    .select("*")
    .order("shipped_date", { ascending: false })
  if (shipError) throw shipError

  const shipmentIds = (shipmentRows ?? []).map((s) => s.id)
  const { data: stageRows, error: stageError } = await supabase
    .from("shipment_stages")
    .select("*")
    .in("shipment_id", shipmentIds)
    .order("timestamp", { ascending: true })
  if (stageError) throw stageError

  const stagesByShipment = new Map<string, typeof stageRows>()
  for (const s of stageRows ?? []) {
    const arr = stagesByShipment.get(s.shipment_id) ?? []
    arr.push(s)
    stagesByShipment.set(s.shipment_id, arr)
  }

  return (shipmentRows ?? []).map((row) =>
    mapShipment(row, stagesByShipment.get(row.id) ?? [])
  )
}

// ── Partners ───────────────────────────────────────────────────

export async function fetchPartners(): Promise<Partner[]> {
  const { data, error } = await supabase.from("partners").select("*")
  if (error) throw error
  return (data ?? []).map(mapPartner)
}

export async function fetchPartnerReps(): Promise<PartnerRep[]> {
  const { data, error } = await supabase.from("partner_reps").select("*")
  if (error) throw error
  return (data ?? []).map(mapPartnerRep)
}

// ── Products ───────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name")
  if (error) throw error
  return (data ?? []).map(mapProduct)
}

// ── Analytics ──────────────────────────────────────────────────

export async function fetchMonthlyMetrics(): Promise<MonthlyMetrics[]> {
  const { data, error } = await supabase
    .from("monthly_metrics")
    .select("*")
    .order("month", { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapMonthlyMetrics)
}
