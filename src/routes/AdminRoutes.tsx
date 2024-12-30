import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"

const DashboardPage = lazy(() => import("../pages/Admin/DashboardPage"))
const ProductsPage = lazy(() => import("../pages/Admin/ProductsPage"))
const InventoryPage = lazy(() => import("../pages/Admin/InventoryPage"))
const LiveLogsPage = lazy(() => import("../pages/Admin/LiveLogsPage"))
const OrdersPage = lazy(() => import("../pages/Admin/OrdersPage"))

const AdminRoutes = () => (
  <Routes>
    <Route index element={<Suspense fallback={<div>Loading...</div>}><DashboardPage /></Suspense>} />
    <Route path="products" element={<Suspense fallback={<div>Loading...</div>}><ProductsPage /></Suspense>} />
    <Route path="inventory" element={<Suspense fallback={<div>Loading...</div>}><InventoryPage /></Suspense>} />
    <Route path="live-logs" element={<Suspense fallback={<div>Loading...</div>}><LiveLogsPage /></Suspense>} />
    <Route path="orders" element={<Suspense fallback={<div>Loading...</div>}><OrdersPage /></Suspense>} />
  </Routes>
)

export default AdminRoutes
