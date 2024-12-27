import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"

// Lazy loaded admin pages
const DashboardPage = lazy(() => import("../pages/Admin/DashboardPage"))
const ProductsPage = lazy(() => import("../pages/Admin/ProductsPage"))
const InventoryPage = lazy(() => import("../pages/Admin/InventoryPage"))
const LogsPage = lazy(() => import("../pages/Admin/LogsPage"))
const LiveLogsPage = lazy(() => import("../pages/Admin/LiveLogsPage"))
const CustomersPage = lazy(() => import("../pages/Admin/CustomersPage"))
const SettingsPage = lazy(() => import("../pages/Admin/SettingsPage"))

const AdminRoutes = () => (
  <Routes>
    <Route index element={<Suspense fallback={<div>Loading...</div>}><DashboardPage /></Suspense>} />
    <Route path="products" element={<Suspense fallback={<div>Loading...</div>}><ProductsPage /></Suspense>} />
    <Route path="inventory" element={<Suspense fallback={<div>Loading...</div>}><InventoryPage /></Suspense>} />
    <Route path="logs" element={<Suspense fallback={<div>Loading...</div>}><LogsPage /></Suspense>} />
    <Route path="live-logs" element={<Suspense fallback={<div>Loading...</div>}><LiveLogsPage /></Suspense>} />
    <Route path="customers" element={<Suspense fallback={<div>Loading...</div>}><CustomersPage /></Suspense>} />
    <Route path="settings" element={<Suspense fallback={<div>Loading...</div>}><SettingsPage /></Suspense>} />
  </Routes>
)

export default AdminRoutes
