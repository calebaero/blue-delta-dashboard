import { useLocation } from "react-router"

interface BreadcrumbItem {
  label: string
  href?: string
}

const routeLabels: Record<string, string> = {
  "": "Dashboard",
  customers: "Customers",
  orders: "Orders",
  measurements: "Measurements",
  production: "Production Pipeline",
  inventory: "Inventory",
  rolls: "Roll Detail",
  products: "Products",
  shipping: "Shipping",
  partners: "B2B Partners",
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  if (segments.length === 0) {
    return [{ label: "Dashboard" }]
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/" },
  ]

  let currentPath = ""
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    currentPath += `/${segment}`

    const label = routeLabels[segment]
    if (label) {
      if (i === segments.length - 1) {
        breadcrumbs.push({ label })
      } else {
        breadcrumbs.push({ label, href: currentPath })
      }
    } else {
      // It's a dynamic segment (like an ID)
      breadcrumbs.push({ label: segment.toUpperCase() })
    }
  }

  return breadcrumbs
}
