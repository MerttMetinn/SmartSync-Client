import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Swal from 'sweetalert2'
import { LayoutDashboard, Package, BarChart3, ClipboardList, Users, Settings, LogOut } from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

interface SidebarProps {
  isOpen: boolean
}

const menuItems = [
  { 
    title: 'Dashboard', 
    path: '/admin', 
    icon: LayoutDashboard,
    gradient: 'from-sky-400 to-blue-600',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
  },
  { 
    title: 'Ürün Yönetimi', 
    path: '/admin/products', 
    icon: Package,
    gradient: 'from-violet-400 to-purple-600',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
  },
  { 
    title: 'Stok Durumu', 
    path: '/admin/inventory', 
    icon: BarChart3,
    gradient: 'from-emerald-400 to-green-600',
    hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20'
  },
  { 
    title: 'Sipariş Logları', 
    path: '/admin/logs', 
    icon: ClipboardList,
    gradient: 'from-amber-400 to-orange-600',
    hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
  },
  { 
    title: 'Müşteriler', 
    path: '/admin/customers', 
    icon: Users,
    gradient: 'from-pink-400 to-rose-600',
    hoverBg: 'hover:bg-rose-50 dark:hover:bg-rose-900/20'
  },
  { 
    title: 'Ayarlar', 
    path: '/admin/settings', 
    icon: Settings,
    gradient: 'from-indigo-400 to-blue-600',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
  }
]

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { logout } = useAuth()
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
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg border-r border-gray-200/30 dark:border-gray-800/30 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className={`text-xl font-bold text-white transition-all duration-300 ${
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
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all group ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : `text-gray-600 dark:text-gray-400 ${item.hoverBg}`
                  } ${!isOpen ? 'justify-center' : ''}`}
              >
                <div className={`relative ${!isOpen ? 'w-10 h-10 flex items-center justify-center' : ''}`}>
                  <item.icon 
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    }`} 
                    strokeWidth={1.5}
                  />
                </div>
                {isOpen && (
                  <span className="ml-3 whitespace-nowrap">{item.title}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/30 dark:border-gray-800/30">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg group transition-colors bg-gradient-to-r hover:from-rose-500 hover:to-red-600 ${
              !isOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut 
              className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-white transition-colors" 
              strokeWidth={1.5}
            />
            {isOpen && (
              <span className="ml-3 text-gray-600 dark:text-gray-400 group-hover:text-white">
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

