import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'

// Layouts
import AuthLayout from './layouts/AuthLayout'

// Lazy loaded pages
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'))
const DashboardPage = lazy(() => import('./pages/Admin/DashboardPage'))
const HomePage = lazy(() => import('./pages/Customer/HomePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Loading component
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children, allowedUserType }: { children: React.ReactNode, allowedUserType: 'company' | 'customer' }) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (user.type !== allowedUserType) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedUserType="company">
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Customer Routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedUserType="customer">
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes