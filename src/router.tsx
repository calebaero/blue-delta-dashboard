import { createBrowserRouter } from "react-router"
import App from "@/App"

import DashboardPage from "@/pages/Dashboard"
import CustomersPage from "@/pages/Customers"
import CustomerDetailPage from "@/pages/CustomerDetail"
import OrdersPage from "@/pages/Orders"
import OrderDetailPage from "@/pages/OrderDetail"
import ProductionPage from "@/pages/Production"
import InventoryPage from "@/pages/Inventory"
import RollDetailPage from "@/pages/RollDetail"
import ProductsPage from "@/pages/Products"
import ProductDetailPage from "@/pages/ProductDetail"
import ShippingPage from "@/pages/Shipping"
import ShipmentDetailPage from "@/pages/ShipmentDetail"
import PartnersPage from "@/pages/Partners"
import PartnerDetailPage from "@/pages/PartnerDetail"
import MeasurementsPage from "@/pages/Measurements"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "customers/:id", element: <CustomerDetailPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      { path: "production", element: <ProductionPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "inventory/rolls/:id", element: <RollDetailPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "shipping", element: <ShippingPage /> },
      { path: "shipping/:id", element: <ShipmentDetailPage /> },
      { path: "partners", element: <PartnersPage /> },
      { path: "partners/:id", element: <PartnerDetailPage /> },
      { path: "measurements", element: <MeasurementsPage /> },
    ],
  },
])
