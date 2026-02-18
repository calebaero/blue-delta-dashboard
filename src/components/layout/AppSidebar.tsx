import { useLocation, useNavigate } from "react-router"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Ruler,
  Factory,
  Package,
  Tag,
  Truck,
  Handshake,
  Scissors,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "OVERVIEW",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    ],
  },
  {
    label: "SALES & CUSTOMERS",
    items: [
      { title: "Customers", icon: Users, href: "/customers" },
      { title: "Orders", icon: ShoppingCart, href: "/orders" },
      { title: "Measurements", icon: Ruler, href: "/measurements" },
    ],
  },
  {
    label: "MANUFACTURING",
    items: [
      { title: "Production Pipeline", icon: Factory, href: "/production" },
      { title: "Inventory", icon: Package, href: "/inventory" },
      { title: "Products", icon: Tag, href: "/products" },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { title: "Shipping", icon: Truck, href: "/shipping" },
      { title: "B2B Partners", icon: Handshake, href: "/partners" },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  function isActive(href: string) {
    if (href === "/") return location.pathname === "/"
    return location.pathname.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-r from-indigo-700/10 to-indigo-500/5 px-3 py-4 dark:from-indigo-700/20 dark:to-indigo-500/10">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-indigo-700 text-white shadow-sm">
            <Scissors className="size-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight text-slate-800 dark:text-slate-100">Blue Delta Jeans</span>
              <span className="text-[10px] text-muted-foreground leading-tight">Tupelo, MS · Database System</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={active}
                        onClick={() => navigate(item.href)}
                        className={
                          active
                            ? "bg-indigo-700 text-white hover:bg-indigo-800 hover:text-white"
                            : ""
                        }
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* Footer spacer for visual balance */}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
