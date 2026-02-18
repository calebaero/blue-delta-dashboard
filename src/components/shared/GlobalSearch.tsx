import { useEffect, useState, useMemo, useCallback } from "react"
import { useNavigate } from "react-router"
import { Users, ShoppingCart, Handshake, Tag } from "lucide-react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { useCustomerStore } from "@/stores/useCustomerStore"
import { useOrderStore } from "@/stores/useOrderStore"
import { usePartnerStore } from "@/stores/usePartnerStore"
import { initializeMockData } from "@/data/mockData"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const customers = useCustomerStore((s) => s.customers)
  const orders = useOrderStore((s) => s.orders)
  const partners = usePartnerStore((s) => s.partners)
  const { products } = initializeMockData()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const selectItem = useCallback(
    (path: string) => {
      setOpen(false)
      navigate(path)
    },
    [navigate]
  )

  // Pre-compute top customers and orders for quick results
  const topCustomers = useMemo(
    () => customers.slice(0, 50),
    [customers]
  )
  const topOrders = useMemo(
    () => orders.slice(0, 50),
    [orders]
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Global Search"
      description="Search customers, orders, products, and partners"
    >
      <CommandInput placeholder="Search customers, orders, products..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Customers">
          {topCustomers.map((c) => (
            <CommandItem
              key={c.id}
              value={`${c.firstName} ${c.lastName} ${c.email}`}
              onSelect={() => selectItem(`/customers/${c.id}`)}
            >
              <Users className="size-4 text-muted-foreground" />
              <span>
                {c.firstName} {c.lastName}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                {c.email}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Orders">
          {topOrders.map((o) => (
            <CommandItem
              key={o.id}
              value={`${o.id} order`}
              onSelect={() => selectItem(`/orders/${o.id}`)}
            >
              <ShoppingCart className="size-4 text-muted-foreground" />
              <span>{o.id}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {o.status}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Products">
          {products.map((p) => (
            <CommandItem
              key={p.id}
              value={`${p.name} ${p.category} product`}
              onSelect={() => selectItem(`/products/${p.id}`)}
            >
              <Tag className="size-4 text-muted-foreground" />
              <span>{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {p.category}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Partners">
          {partners.map((p) => (
            <CommandItem
              key={p.id}
              value={`${p.name} ${p.type} partner`}
              onSelect={() => selectItem(`/partners/${p.id}`)}
            >
              <Handshake className="size-4 text-muted-foreground" />
              <span>{p.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {p.type}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
