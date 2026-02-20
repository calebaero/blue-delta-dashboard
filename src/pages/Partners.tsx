import { useEffect, useMemo } from "react"
import { Link } from "react-router"
import { ArrowRight } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageLoadingState } from "@/components/shared/PageLoadingState"
import { usePartnerStore } from "@/stores/usePartnerStore"

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

const TYPE_COLORS: Record<string, string> = {
  Clothier:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Corporate:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Retailer:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
}

export default function PartnersPage() {
  const partners = usePartnerStore((s) => s.partners)
  const getPartnerMetrics = usePartnerStore((s) => s.getPartnerMetrics)

  const fetchData = usePartnerStore((s) => s.fetchData)
  const isLoading = usePartnerStore((s) => s.isLoading)
  const error = usePartnerStore((s) => s.error)

  useEffect(() => { fetchData() }, [])

  const stats = useMemo(() => {
    const totalPartners = partners.length
    const activeOrders = partners.reduce((sum, p) => sum + p.activeOrders, 0)
    const totalRevenue = partners.reduce((sum, p) => sum + p.totalRevenue, 0)
    const topPartner = [...partners].sort(
      (a, b) => b.totalRevenue - a.totalRevenue
    )[0]
    return { totalPartners, activeOrders, totalRevenue, topPartner }
  }, [partners])

  return (
    <PageContainer title="B2B Partners">
      <PageLoadingState isLoading={isLoading} error={error}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.totalPartners}</p>
              <p className="text-xs text-muted-foreground">Total Partners</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold">{stats.activeOrders}</p>
              <p className="text-xs text-muted-foreground">Active B2B Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="text-lg font-semibold text-emerald-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-muted-foreground">B2B Revenue Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="px-3 py-2.5 text-center">
              <p className="truncate text-lg font-semibold">
                {stats.topPartner?.name ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">Top Partner</p>
            </CardContent>
          </Card>
        </div>

        {/* Partner cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {partners.map((partner) => {
            const metrics = getPartnerMetrics(partner.id)
            return (
              <Card key={partner.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {partner.name}
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {partner.address.city}, {partner.address.state}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${TYPE_COLORS[partner.type] ?? ""}`}
                    >
                      {partner.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <p className="text-xl font-bold text-emerald-600">
                        {formatCurrency(partner.totalRevenue)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Total Revenue
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">
                        {partner.totalOrders}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Total Orders
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Active Orders
                      </span>
                      <span className="font-medium">{partner.activeOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Account Since
                      </span>
                      <span>{formatDate(partner.accountSince)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment Terms
                      </span>
                      <span>{partner.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Avg Return Rate
                      </span>
                      <span
                        className={
                          metrics.avgReturnRate > 8
                            ? "text-red-600"
                            : metrics.avgReturnRate > 5
                              ? "text-amber-600"
                              : "text-emerald-600"
                        }
                      >
                        {metrics.avgReturnRate}%
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/partners/${partner.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                  >
                    View Partner
                    <ArrowRight className="size-3" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      </PageLoadingState>
    </PageContainer>
  )
}
