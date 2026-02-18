import type {
  Customer,
  MeasurementProfile,
  FabricRoll,
  HardwareItem,
  Order,
  Product,
  Shipment,
  Partner,
  PartnerRep,
  MonthlyMetrics,
} from "./types"

import { generateProducts } from "./products"
import { generatePartners, generatePartnerReps } from "./partners"
import { generateCustomers } from "./customers"
import { generateMeasurements } from "./measurements"
import { generateFabricRolls, generateHardware } from "./inventory"
import { generateOrders } from "./orders"
import { generateShipments } from "./shipping"
import { generateMonthlyMetrics } from "./analytics"

export interface MockData {
  products: Product[]
  partners: Partner[]
  partnerReps: PartnerRep[]
  customers: Customer[]
  measurements: MeasurementProfile[]
  fabricRolls: FabricRoll[]
  hardware: HardwareItem[]
  orders: Order[]
  shipments: Shipment[]
  monthlyMetrics: MonthlyMetrics[]
}

let cachedData: MockData | null = null

export function initializeMockData(): MockData {
  if (cachedData) return cachedData

  // Generate in dependency order
  const products = generateProducts()
  const partners = generatePartners()
  const partnerReps = generatePartnerReps(partners)
  const customers = generateCustomers()
  const measurements = generateMeasurements(customers)
  const fabricRolls = generateFabricRolls()
  const hardware = generateHardware()
  const orders = generateOrders(
    customers,
    measurements,
    fabricRolls,
    products,
    partners,
    partnerReps
  )
  const shipments = generateShipments(orders)
  const monthlyMetrics = generateMonthlyMetrics()

  // Update partner aggregate fields from generated orders
  for (const partner of partners) {
    const partnerOrders = orders.filter((o) => o.partnerId === partner.id)
    partner.totalOrders = partnerOrders.length
    partner.totalRevenue = partnerOrders.reduce((sum, o) => sum + o.totalPrice, 0)
    partner.activeOrders = partnerOrders.filter(
      (o) => o.status !== "Shipped"
    ).length
  }

  // Update partner rep aggregate fields
  for (const rep of partnerReps) {
    const repOrders = orders.filter((o) => o.partnerRepId === rep.id)
    rep.totalOrders = repOrders.length
    rep.totalRevenue = repOrders.reduce((sum, o) => sum + o.totalPrice, 0)
  }

  cachedData = {
    products,
    partners,
    partnerReps,
    customers,
    measurements,
    fabricRolls,
    hardware,
    orders,
    shipments,
    monthlyMetrics,
  }

  return cachedData
}
