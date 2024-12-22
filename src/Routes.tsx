import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import CustomerLayout from './layouts/CustomerLayout'

// Routes
import AdminRoutes from './routes/AdminRoutes'
import CustomerRoutes from './routes/CustomerRoutes'

// Lazy loaded pages
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedUserType: 'admin' | 'customer'
}

const ProtectedRoute = ({ children, allowedUserType }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (user.type !== allowedUserType) {
    return <Navigate to={user.type === 'admin' ? '/admin' : '/customer'} replace />
  }

  return <>{children}</>
}

const AppRoutes = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Auth Route */}
        <Route path="/auth" element={
          user ? (
            <Navigate to={user.type === 'admin' ? '/admin' : '/customer/home'} replace />
          ) : (
            <AuthLayout />
          )
        }>
          <Route index element={<AuthPage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedUserType="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<AdminRoutes />} />
        </Route>

        {/* Customer Routes */}
        <Route
          path="/customer/*"
          element={
            <ProtectedRoute allowedUserType="customer">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<CustomerRoutes />} />
        </Route>

        {/* Root Redirect */}
        <Route
          path="/"
          element={
            <Navigate to={user ? (user.type === 'admin' ? '/admin' : '/customer/home') : '/auth'} replace />
          }
        />

        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
