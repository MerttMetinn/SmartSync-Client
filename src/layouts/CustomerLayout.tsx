import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/shared/Customer/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Bell, Menu } from 'lucide-react'

export default function CustomerLayout() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    handleResize() // İlk kontrol
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <div className="flex h-screen">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
  <div className="h-full px-4 flex items-center justify-between">
    <button
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      className="p-2 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
      aria-label="Toggle Sidebar"
    >
      <Menu className="h-5 w-5 text-violet-600 dark:text-violet-400" />
    </button>

    <div className="flex items-center space-x-4">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
        aria-label={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        ) : (
          <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        )}
      </button>

      <button
        className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors relative"
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-800" />
      </button>

      <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
        <span className="text-sm font-medium text-white">
          {user?.name}
        </span>
      </div>
    </div>
  </div>
</header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}