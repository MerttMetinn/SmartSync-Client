import { Routes, Route } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import AuthPage from './pages/Auth/AuthPage'
import DashboardPage from './pages/Admin/DashboardPage'
import HomePage from './pages/Customer/HomePage'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/customer" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes