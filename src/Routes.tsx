import { Routes, Route, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { useAuth } from './contexts/AuthContext'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

// Routes
import AdminRoutes from './routes/AdminRoutes'

// Lazy loaded pages
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'))
const HomePage = lazy(() => import('./pages/Customer/HomePage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const PageLoader = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
)

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
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {AdminRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>

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