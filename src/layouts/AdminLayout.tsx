import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '@/components/shared/Admin/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Bell, Menu } from 'lucide-react'

export default function AdminLayout() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation()

  // Sayfa değiştiğinde mobilde sidebar'ı otomatik kapat
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  // Ekran boyutu değiştiğinde sidebar durumunu kontrol et
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar isOpen={isSidebarOpen} />
      
      {/* Mobilde sidebar açıkken overlay göster */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? '' : ''
      }`}>
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label={isSidebarOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartSync Yönetim Paneli
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Bildirimler"
              >
                <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label={theme === 'light' ? 'Karanlık Moda Geç' : 'Aydınlık Moda Geç'}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-gray-600" />
                ) : (
                  <Sun className="h-5 w-5 text-gray-300" />
                )}
              </button>
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-shadow">
                <span className="text-sm">{user?.name}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-gray-900">
          <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}