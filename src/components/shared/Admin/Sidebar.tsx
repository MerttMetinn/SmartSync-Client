import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Swal from 'sweetalert2'
import { LayoutDashboard, Package, LogOut, Radio, ShoppingCart, PackageSearch } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
}

const menuItems = [
  { 
    title: 'Dashboard', 
    path: '/admin', 
    icon: LayoutDashboard,
    gradient: 'from-indigo-500 to-blue-600',
    hoverBg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
  },
  { 
    title: 'Ürün Yönetimi', 
    path: '/admin/products', 
    icon: Package,
    gradient: 'from-fuchsia-500 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
  },
  { 
    title: 'Stok Yönetimi', 
    path: '/admin/inventory', 
    icon: PackageSearch,
    gradient: 'from-teal-500 to-emerald-600',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
  },
  { 
    title: 'Sipariş Yönetimi', 
    path: '/admin/orders', 
    icon: ShoppingCart,
    gradient: 'from-orange-500 to-amber-600',
    hoverBg: 'hover:bg-amber-50 dark:hover:bg-amber-900/20'
  },
  { 
    title: 'Canlı Log Akışı', 
    path: '/admin/live-logs', 
    icon: Radio,
    gradient: 'from-rose-500 to-pink-600',
    hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-900/20'
  }
]

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { logout } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Çıkış yapmak istediğinize emin misiniz?',
      text: "Oturumunuz sonlandırılacak.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, çıkış yap',
      cancelButtonText: 'İptal',
      background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
    })

    if (result.isConfirmed) {
      logout()
      navigate('/auth')
      Swal.fire({
        title: 'Çıkış Yapıldı!',
        text: 'Başarıyla çıkış yaptınız.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000'
      })
    }
  }

  return (
    <aside 
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen 
        ${theme === 'dark' 
          ? 'bg-gray-900/95 border-gray-800/30' 
          : 'bg-white/95 border-gray-200/30'} 
        backdrop-blur-xl shadow-lg border-r transition-all duration-300 ease-in-out 
        ${isOpen ? 'w-64' : 'w-20'}`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <h1 className={`text-xl font-bold text-white relative z-10 transition-all duration-300 ${
            isOpen ? 'w-full text-center' : 'w-20 text-center text-sm'
          }`}>
            {isOpen ? 'SmartSync' : 'SS'}
          </h1>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all group relative overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : `text-gray-600 dark:text-gray-400 ${item.hoverBg}`
                  } ${!isOpen ? 'justify-center' : ''}`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
                )}
                <div className={`relative ${!isOpen ? 'w-10 h-10 flex items-center justify-center' : ''}`}>
                  <item.icon 
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`} 
                    strokeWidth={1.5}
                  />
                </div>
                {isOpen && (
                  <span className="ml-3 whitespace-nowrap relative">{item.title}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/30 dark:border-gray-800/30">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg group 
              transition-colors bg-gradient-to-r hover:from-rose-500 hover:to-red-600 relative overflow-hidden
              ${!isOpen ? 'justify-center' : ''}`}
          >
            <LogOut 
              className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors" 
              strokeWidth={1.5}
            />
            {isOpen && (
              <span className="ml-3 text-gray-600 dark:text-gray-400 group-hover:text-white relative">
                Çıkış Yap
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

