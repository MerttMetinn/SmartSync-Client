import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import CustomerLayout from './layouts/CustomerLayout'

import AdminRoutes from './routes/AdminRoutes'
import CustomerRoutes from './routes/CustomerRoutes'

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
  const { user } = useAuth()

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/auth" element={
          <Suspense fallback={<PageLoader />}>
            <AuthPage />
          </Suspense>
        } />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedUserType="admin">
          <AdminLayout>
            <Suspense fallback={<PageLoader />}>
              <AdminRoutes />
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Customer Routes */}
      <Route path="/customer/*" element={
        <ProtectedRoute allowedUserType="customer">
          <CartProvider>
            <CustomerLayout>
              <Suspense fallback={<PageLoader />}>
                <CustomerRoutes />
              </Suspense>
            </CustomerLayout>
          </CartProvider>
        </ProtectedRoute>
      } />

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          <Navigate to={user ? (user.type === 'admin' ? '/admin' : '/customer/home') : '/auth'} replace />
        }
      />

      {/* Not Found */}
      <Route path="*" element={
        <Suspense fallback={<PageLoader />}>
          <NotFoundPage />
        </Suspense>
      } />
    </Routes>
  )
}

export default AppRoutes
