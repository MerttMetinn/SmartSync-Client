import { Routes, Route } from 'react-router-dom'
import DashboardPage from '../pages/Admin/DashboardPage'

const AdminRoutes = () => (
  <Routes>
    <Route path="dashboard" element={<DashboardPage />} />
  </Routes>
)

export default AdminRoutes