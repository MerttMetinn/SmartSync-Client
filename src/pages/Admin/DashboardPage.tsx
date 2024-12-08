import React from 'react'
import { Card } from '@/components/ui/card'
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle
} from 'lucide-react'

const stats = [
  {
    title: 'Toplam Ürün',
    value: '124',
    icon: Package,
    change: '+4.75%',
    changeType: 'increase',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Aktif Siparişler',
    value: '12',
    icon: ShoppingCart,
    change: '+10.25%',
    changeType: 'increase',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Toplam Müşteri',
    value: '48',
    icon: Users,
    change: '+2.35%',
    changeType: 'increase',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Kritik Stok',
    value: '3',
    icon: AlertTriangle,
    change: '-1',
    changeType: 'decrease',
    color: 'from-red-500 to-red-600'
  }
]

const DashboardPage = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6 z-10 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                    {stat.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className={`mt-4 flex items-center text-sm ${
                stat.changeType === 'increase'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                <span className="font-medium">{stat.change}</span>
                <span className="ml-1">
                  {stat.changeType === 'increase' ? 'artış' : 'azalış'}
                </span>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Satış Grafiği
          </h3>
          <div className="h-80 w-full">
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Son Aktiviteler
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage