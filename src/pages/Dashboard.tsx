import { useMemo } from "react"
import { PageContainer } from "@/components/layout/PageContainer"
import { KpiCard } from "@/components/charts/KpiCard"
import { PipelineChart } from "@/components/charts/PipelineChart"
import { InventoryAlertList } from "@/components/charts/InventoryAlertList"
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart"
import { RecentOrdersTable } from "@/components/charts/RecentOrdersTable"
import { ChannelMixChart } from "@/components/charts/ChannelMixChart"
import { useOrderStore } from "@/stores/useOrderStore"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useInventoryStore } from "@/stores/useInventoryStore"
import { useProductionStore } from "@/stores/useProductionStore"
import { useAnalyticsStore } from "@/stores/useAnalyticsStore"
import { initializeMockData } from "@/data/mockData"

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

export default function DashboardPage() {
  const orders = useOrderStore((s) => s.orders)
  const customers = useCustomerStore((s) => s.customers)
  const getInventoryAlerts = useInventoryStore((s) => s.getInventoryAlerts)
  const getOrdersByStage = useProductionStore((s) => s.getOrdersByStage)
  const monthlyMetrics = useAnalyticsStore((s) => s.monthlyMetrics)
  const getChannelMixData = useAnalyticsStore((s) => s.getChannelMixData)
  const getRevenueData = useAnalyticsStore((s) => s.getRevenueData)

  const { products } = initializeMockData()

  const kpis = useMemo(() => {
    // Find the most recent order date in data to use as "today"
    const allDates = orders.map((o) => o.orderDate).sort()
    const mostRecentDate = allDates[allDates.length - 1] || "2026-02-15"
    const currentMonth = mostRecentDate.slice(0, 7)

    // 1. New Orders Today (use most recent date)
    const todayOrders = orders.filter(
      (o) => o.orderDate === mostRecentDate
    ).length
    // Compare to 30 days before
    const thirtyDaysAgo = new Date(mostRecentDate)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const compDate = thirtyDaysAgo.toISOString().split("T")[0]
    const lastMonthSameDay = orders.filter(
      (o) => o.orderDate === compDate
    ).length
    const todayTrend =
      lastMonthSameDay > 0
        ? ((todayOrders - lastMonthSameDay) / lastMonthSameDay) * 100
        : todayOrders > 0
          ? 100
          : 0

    // 2. Units in Production
    const inProduction = orders.filter(
      (o) => o.status !== "Shipped" && o.status !== "Order Received"
    ).length
    // Sparkline from monthly metrics
    const productionSparkline = monthlyMetrics.slice(-6).map((m) => ({
      value: m.orderCount - Math.round(m.orderCount * 0.2), // approximate active
    }))
    const prevProduction = productionSparkline.length >= 2
      ? productionSparkline[productionSparkline.length - 2].value
      : inProduction
    const productionTrend =
      prevProduction > 0
        ? ((inProduction - prevProduction) / prevProduction) * 100
        : 0

    // 3. Fabric Utilization (from latest month metrics)
    const latestMetrics = monthlyMetrics[monthlyMetrics.length - 1]
    const prevMetrics =
      monthlyMetrics.length >= 2
        ? monthlyMetrics[monthlyMetrics.length - 2]
        : null
    const fabricUtil = latestMetrics
      ? (latestMetrics.fabricYardsConsumed / latestMetrics.fabricYardsReceived) *
        100
      : 0
    const prevFabricUtil = prevMetrics
      ? (prevMetrics.fabricYardsConsumed / prevMetrics.fabricYardsReceived) * 100
      : fabricUtil
    const fabricTrend =
      prevFabricUtil > 0
        ? ((fabricUtil - prevFabricUtil) / prevFabricUtil) * 100
        : 0
    const fabricSparkline = monthlyMetrics.slice(-6).map((m) => ({
      value:
        m.fabricYardsReceived > 0
          ? (m.fabricYardsConsumed / m.fabricYardsReceived) * 100
          : 0,
    }))

    // 4. Revenue MTD
    const mtdOrders = orders.filter(
      (o) => o.orderDate.startsWith(currentMonth)
    )
    const revenueMTD = mtdOrders.reduce((sum, o) => sum + o.totalPrice, 0)
    const prevMonth = latestMetrics
      ? prevMetrics?.revenue ?? 0
      : 0
    const revenueTrend =
      prevMonth > 0 ? ((revenueMTD - prevMonth) / prevMonth) * 100 : 0
    const revenueSparkline = monthlyMetrics.slice(-6).map((m) => ({
      value: m.revenue,
    }))

    // 5. Avg Lead Time
    const shippedThisMonth = orders.filter(
      (o) =>
        o.status === "Shipped" &&
        o.completedDate &&
        o.completedDate.startsWith(currentMonth)
    )
    let avgLeadTime = 0
    if (shippedThisMonth.length > 0) {
      const totalDays = shippedThisMonth.reduce((sum, o) => {
        const start = new Date(o.orderDate)
        const end = new Date(o.completedDate!)
        return (
          sum +
          Math.floor(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      }, 0)
      avgLeadTime = Math.round(totalDays / shippedThisMonth.length)
    }
    const prevLeadTime = prevMetrics?.averageLeadTimeDays ?? avgLeadTime
    const leadTimeTrend =
      prevLeadTime > 0
        ? ((avgLeadTime - prevLeadTime) / prevLeadTime) * 100
        : 0
    const leadTimeSparkline = monthlyMetrics.slice(-6).map((m) => ({
      value: m.averageLeadTimeDays,
    }))

    // 6. On-Time Delivery
    let onTimeRate = 0
    if (shippedThisMonth.length > 0) {
      const onTime = shippedThisMonth.filter(
        (o) => o.completedDate && o.completedDate <= o.promisedDate
      ).length
      onTimeRate = (onTime / shippedThisMonth.length) * 100
    }
    const prevOnTime = prevMetrics?.onTimeDeliveryRate ?? onTimeRate
    const onTimeTrend =
      prevOnTime > 0 ? ((onTimeRate - prevOnTime) / prevOnTime) * 100 : 0
    const onTimeSparkline = monthlyMetrics.slice(-6).map((m) => ({
      value: m.onTimeDeliveryRate,
    }))

    return {
      todayOrders,
      todayTrend,
      inProduction,
      productionTrend,
      productionSparkline,
      fabricUtil,
      fabricTrend,
      fabricSparkline,
      revenueMTD,
      revenueTrend,
      revenueSparkline,
      avgLeadTime,
      leadTimeTrend,
      leadTimeSparkline,
      onTimeRate,
      onTimeTrend,
      onTimeSparkline,
    }
  }, [orders, monthlyMetrics])

  const pipelineData = useMemo(() => {
    return getOrdersByStage().map((sg) => ({
      stage: sg.stage,
      count: sg.count,
      avgDaysInStage: sg.avgDaysInStage,
    }))
  }, [getOrdersByStage])

  const inventoryAlerts = useMemo(() => getInventoryAlerts(), [getInventoryAlerts])
  const revenueData = useMemo(() => getRevenueData(), [getRevenueData])
  const channelData = useMemo(() => getChannelMixData(), [getChannelMixData])

  return (
    <PageContainer title="Dashboard">
      <div className="space-y-6">
        {/* ROW 1 — KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            label="New Orders Today"
            value={String(kpis.todayOrders)}
            trend={kpis.todayTrend}
            trendLabel="vs last month"
          />
          <KpiCard
            label="Units in Production"
            value={String(kpis.inProduction)}
            trend={kpis.productionTrend}
            trendLabel="vs last month"
            sparklineData={kpis.productionSparkline}
          />
          <KpiCard
            label="Fabric Utilization"
            value={`${kpis.fabricUtil.toFixed(1)}%`}
            trend={kpis.fabricTrend}
            trendLabel="vs last month"
            sparklineData={kpis.fabricSparkline}
          />
          <KpiCard
            label="Revenue MTD"
            value={formatCurrency(kpis.revenueMTD)}
            trend={kpis.revenueTrend}
            trendLabel="vs last month"
            sparklineData={kpis.revenueSparkline}
          />
          <KpiCard
            label="Avg Lead Time"
            value={`${kpis.avgLeadTime} days`}
            trend={kpis.leadTimeTrend * -1}
            trendLabel="vs last month"
            sparklineData={kpis.leadTimeSparkline}
          />
          <KpiCard
            label="On-Time Delivery"
            value={`${kpis.onTimeRate.toFixed(1)}%`}
            trend={kpis.onTimeTrend}
            trendLabel="vs last month"
            sparklineData={kpis.onTimeSparkline}
          />
        </div>

        {/* ROW 2 — Pipeline + Inventory Alerts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PipelineChart data={pipelineData} />
          </div>
          <div>
            <InventoryAlertList alerts={inventoryAlerts} />
          </div>
        </div>

        {/* ROW 3 — Revenue Trend + Recent Orders */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueTrendChart data={revenueData} />
          <RecentOrdersTable
            orders={orders}
            customers={customers}
            products={products}
          />
        </div>

        {/* ROW 4 — Channel Mix */}
        <ChannelMixChart data={channelData} />
      </div>
    </PageContainer>
  )
}
