import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router"
import type { ColumnDef } from "@tanstack/react-table"
import { LayoutGrid, List, ArrowRight, Check, X } from "lucide-react"
import { PageContainer } from "@/components/layout/PageContainer"
import { PageLoadingState } from "@/components/shared/PageLoadingState"
import { DataTable } from "@/components/shared/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductStore } from "@/stores/useProductStore"
import type { Product, ProductCategory, FabricFamily } from "@/data/types"

const CATEGORIES: ProductCategory[] = ["Pants", "Jacket", "Belt", "Accessory"]
const FABRIC_FAMILIES: FabricFamily[] = [
  "Raw Denim",
  "Cotton Chino",
  "Performance",
  "Cashiers Collection",
]

const FABRIC_FAMILY_COLORS: Record<FabricFamily, string> = {
  "Raw Denim": "bg-indigo-700",
  "Cotton Chino": "bg-amber-600",
  Performance: "bg-slate-500",
  "Cashiers Collection": "bg-blue-900",
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`
}

export default function ProductsPage() {
  const products = useProductStore((s) => s.products)
  const fetchProductData = useProductStore((s) => s.fetchData)
  const productLoading = useProductStore((s) => s.isLoading)
  const productError = useProductStore((s) => s.error)

  useEffect(() => {
    fetchProductData()
  }, [])

  const [view, setView] = useState<"grid" | "list">("grid")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [fabricFilter, setFabricFilter] = useState("All")

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false
      if (fabricFilter !== "All" && p.fabricFamily !== fabricFilter) return false
      return true
    })
  }, [products, categoryFilter, fabricFilter])

  const listColumns: ColumnDef<Product>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            to={`/products/${row.original.id}`}
            className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-400"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.category}
          </Badge>
        ),
      },
      {
        accessorKey: "basePrice",
        header: "Price",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.basePrice)}
          </span>
        ),
      },
      {
        accessorKey: "fabricFamily",
        header: "Fabric Family",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.fabricFamily}</span>
        ),
      },
      {
        accessorKey: "customizationOptions",
        header: "Customizations",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.customizationOptions.length} options
          </span>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Active",
        cell: ({ row }) =>
          row.original.isActive ? (
            <Check className="size-4 text-emerald-600" />
          ) : (
            <X className="size-4 text-red-500" />
          ),
      },
    ],
    []
  )

  return (
    <PageContainer title="Product Catalog">
      <PageLoadingState isLoading={productLoading} error={productError}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-md border">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              className={`gap-1 rounded-r-none ${
                view === "grid"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : ""
              }`}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="size-3.5" />
              Grid
            </Button>
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              className={`gap-1 rounded-l-none ${
                view === "list"
                  ? "bg-indigo-700 text-white hover:bg-indigo-800"
                  : ""
              }`}
              onClick={() => setView("list")}
            >
              <List className="size-3.5" />
              List
            </Button>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fabricFilter} onValueChange={setFabricFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Fabrics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Fabrics</SelectItem>
              {FABRIC_FAMILIES.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid or List */}
        {view === "grid" ? (
          filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div
                    className={`h-3 ${FABRIC_FAMILY_COLORS[product.fabricFamily]}`}
                  />
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-sm font-bold">{product.name}</h3>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-indigo-700 dark:text-indigo-400">
                        {formatCurrency(product.basePrice)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {product.fabricFamily}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {product.description}
                    </p>
                    <Link
                      to={`/products/${product.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                      View Details
                      <ArrowRight className="size-3" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LayoutGrid className="mb-3 size-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No products match your filters
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setCategoryFilter("All")
                  setFabricFilter("All")
                }}
              >
                Clear filters
              </Button>
            </div>
          )
        ) : (
          <DataTable columns={listColumns} data={filteredProducts} pageSize={20} />
        )}
      </div>
      </PageLoadingState>
    </PageContainer>
  )
}
