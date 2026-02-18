import { faker } from "@faker-js/faker"
import type { MonthlyMetrics } from "./types"

export function generateMonthlyMetrics(): MonthlyMetrics[] {
  faker.seed(4205)

  const months: MonthlyMetrics[] = []

  // 18 months: 2024-09 through 2026-02
  const startYear = 2024
  const startMonth = 9

  for (let i = 0; i < 18; i++) {
    const month = startMonth + i
    const year = startYear + Math.floor((month - 1) / 12)
    const monthNum = ((month - 1) % 12) + 1
    const monthStr = `${year}-${String(monthNum).padStart(2, "0")}`

    // Growth factor: 1.0 at start, ~1.47 at end (18 months of growth)
    const growthFactor = 1 + i * 0.026

    // Seasonal adjustment
    let seasonalFactor = 1.0
    if (monthNum === 11 || monthNum === 12) seasonalFactor = 1.25 // Holiday bump
    if (monthNum === 3 || monthNum === 4) seasonalFactor = 1.1 // Spring bump
    if (monthNum === 7 || monthNum === 8) seasonalFactor = 0.9 // Summer dip

    // Base revenue ~$150K growing to ~$220K
    const baseRevenue = 150000
    const revenue = Math.round(
      baseRevenue * growthFactor * seasonalFactor +
        faker.number.int({ min: -5000, max: 5000 })
    )

    // Order count: 300-500/month
    const baseOrders = 350
    const orderCount = Math.round(
      baseOrders * growthFactor * seasonalFactor +
        faker.number.int({ min: -20, max: 20 })
    )

    // New customers: ~15-30% of orders are new
    const newCustomers = Math.round(
      orderCount * faker.number.float({ min: 0.15, max: 0.3 })
    )

    // Channel mix evolving: B2B growing from 20% to 30%
    const b2bPct = 0.2 + i * 0.006 // 20% → ~30%
    const _dtcWebPct = 0.5 - i * 0.003 // Slight decline (used for documentation)
    const dtcStorePct = 0.15
    const trunkShowPct = 0.05
    // Remaining goes to DTC Web (dtcWebOrders = total - others)
    void _dtcWebPct

    const b2bOrders = Math.round(orderCount * b2bPct)
    const dtcStoreOrders = Math.round(orderCount * dtcStorePct)
    const trunkShowOrders = Math.round(orderCount * trunkShowPct)
    const dtcWebOrders = orderCount - b2bOrders - dtcStoreOrders - trunkShowOrders

    // On-time delivery: 88-96%
    const onTimeDeliveryRate = parseFloat(
      faker.number.float({ min: 88, max: 96, fractionDigits: 1 }).toFixed(1)
    )

    // Average lead time: 30-38 days
    const averageLeadTimeDays = parseFloat(
      faker.number.float({ min: 30, max: 38, fractionDigits: 1 }).toFixed(1)
    )

    // Fabric consumption: orderCount * ~1.6 yards
    const fabricYardsConsumed = Math.round(
      orderCount * 1.6 + faker.number.int({ min: -30, max: 30 })
    )
    // Receiving: slightly more than consumption (building stock)
    const fabricYardsReceived = Math.round(
      fabricYardsConsumed * faker.number.float({ min: 1.0, max: 1.15 })
    )

    months.push({
      month: monthStr,
      revenue,
      orderCount,
      newCustomers,
      dtcWebOrders,
      dtcStoreOrders,
      b2bOrders,
      trunkShowOrders,
      averageLeadTimeDays,
      onTimeDeliveryRate,
      fabricYardsConsumed,
      fabricYardsReceived,
    })
  }

  return months
}
