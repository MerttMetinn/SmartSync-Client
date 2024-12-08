import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Swal from 'sweetalert2'
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ClipboardList,
  Users,
  Settings,
  LogOut,
} from 'lucide-react'
import { Tooltip } from '@/components/ui/tooltip'

interface SidebarProps {
  isOpen: boolean
}

const menuItems = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Ürün Yönetimi',
    path: '/admin/products',
    icon: Package
  },
  {
    title: 'Stok Durumu',
    path: '/admin/inventory',
    icon: BarChart3
  },
  {
    title: 'Sipariş Logları',
    path: '/admin/logs',
    icon: ClipboardList
  },
  {
    title: 'Müşteriler',
    path: '/admin/customers',
    icon: Users
  },
  {
    title: 'Ayarlar',
    path: '/admin/settings',
    icon: Settings
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
      className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-500 to-purple-600">
          <h1 className={`text-xl font-bold text-white transition-all duration-300 ${
            isOpen ? 'w-full text-center' : 'w-20 text-center text-sm'
          }`}>
            {isOpen ? 'SmartSync' : 'SS'}
          </h1>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (item.path === '/admin' && location.pathname === '/admin/');
            
            return (
              <Tooltip
                key={item.path}
                content={!isOpen ? item.title : null}
                side="right"
                className="z-50"
              >
                <NavLink
                  to={item.path}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${!isOpen ? 'justify-center' : ''}`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  {isOpen && (
                    <span className="ml-3 whitespace-nowrap">{item.title}</span>
                  )}
                </NavLink>
              </Tooltip>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <Tooltip
            content={!isOpen ? 'Çıkış Yap' : null}
            side="right"
            className="z-50"
          >
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                !isOpen ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span className="ml-3">Çıkış Yap</span>}
            </button>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar