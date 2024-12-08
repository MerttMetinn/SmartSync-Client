import { Route } from 'react-router-dom'
import { lazy } from 'react'

// Lazy loaded admin pages
const DashboardPage = lazy(() => import('../pages/Admin/DashboardPage'))
const ProductsPage = lazy(() => import('../pages/Admin/ProductsPage'))
const InventoryPage = lazy(() => import('../pages/Admin/InventoryPage'))
const LogsPage = lazy(() => import('../pages/Admin/LogsPage'))
const CustomersPage = lazy(() => import('../pages/Admin/CustomersPage'))
const SettingsPage = lazy(() => import('../pages/Admin/SettingsPage'))

const AdminRoutes = [
  {
    path: "",
    element: <DashboardPage />
  },
  {
    path: "products",
    element: <ProductsPage />
  },
  {
    path: "inventory",
    element: <InventoryPage />
  },
  {
    path: "logs",
    element: <LogsPage />
  },
  {
    path: "customers",
    element: <CustomersPage />
  },
  {
    path: "settings",
    element: <SettingsPage />
  }
]

export default AdminRoutes