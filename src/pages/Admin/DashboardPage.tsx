import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, Package, ShoppingCart } from 'lucide-react'
import axiosInstance from '@/contexts/axiosInstance'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { useTheme } from '@/contexts/ThemeContext'

interface Product {
  id: string
  name: string
  stock: number
  price: number
}

interface Order {
  id: string
  customerId: string
  status: number
  price: number
  createdDate: string
}

interface Customer {
  id: string
  type: 'Normal' | 'Premium'
}

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalCustomers: number
  totalStockValue: number
  recentOrders: Array<{
    date: string
    revenue: number
  }>
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { theme } = useTheme()

  const fetchDashboardData = useCallback(async () => {
    try {
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        axiosInstance.get('/api/Product/GetProducts'),
        axiosInstance.get('/api/Order/GetOrders'),
        axiosInstance.get('/api/Customer/GetCustomers')
      ])

      const products: Product[] = productsRes.data.products
      const orders: Order[] = ordersRes.data.orders
      const customers: Customer[] = customersRes.data.customers

      // Toplam ürün değeri hesaplama
      const totalStockValue = products.reduce((sum, product) => 
        sum + (product.price * product.stock), 0
      )

      // Son 7 günlük siparişleri grupla
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        return date.toISOString().split('T')[0]
      }).reverse()

      const recentOrders = last7Days.map(date => {
        const dayOrders = orders.filter(order => 
          order.createdDate.split('T')[0] === date
        )
        return {
          date: new Date(date).toLocaleDateString('tr-TR'),
          revenue: dayOrders.reduce((sum, order) => sum + order.price, 0)
        }
      })

      setStats({
        totalRevenue: orders.reduce((sum, order) => sum + order.price, 0),
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: customers.length,
        totalStockValue,
        recentOrders
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error('Dashboard verileri yüklenirken bir hata oluştu')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  if (isLoading || !stats) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Toplam Gelir */}
        <Card className="relative p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Gelir
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {stats.totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </h3>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <DollarSign className="h-12 w-12 text-blue-500/20 transform transition-transform group-hover:scale-110" />
          </div>
        </Card>

        {/* Toplam Sipariş */}
        <Card className="relative p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Sipariş
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {stats.totalOrders}
              </h3>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <ShoppingCart className="h-12 w-12 text-purple-500/20 transform transition-transform group-hover:scale-110" />
          </div>
        </Card>

        {/* Toplam Ürün */}
        <Card className="relative p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Ürün
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {stats.totalProducts}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Stok Değeri: {stats.totalStockValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </p>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Package className="h-12 w-12 text-emerald-500/20 transform transition-transform group-hover:scale-110" />
          </div>
        </Card>

        {/* Toplam Müşteri */}
        <Card className="relative p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Toplam Müşteri
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                {stats.totalCustomers}
              </h3>
            </div>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Users className="h-12 w-12 text-orange-500/20 transform transition-transform group-hover:scale-110" />
          </div>
        </Card>
      </div>

      {/* Gelir Grafiği */}
      <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Son 7 Günlük Gelir
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.recentOrders}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-gray-200 dark:stroke-gray-700" 
              />
              <XAxis 
                dataKey="date" 
                className="text-xs text-gray-600 dark:text-gray-400"
                stroke="currentColor"
              />
              <YAxis 
                className="text-xs text-gray-600 dark:text-gray-400"
                stroke="currentColor"
                tickFormatter={(value) => `₺${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: theme === 'dark' ? '#fff' : '#000'
                }}
                formatter={(value: number) => [`₺${value.toLocaleString()}`, 'Gelir']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke={theme === 'dark' ? '#60a5fa' : '#3b82f6'} 
                strokeWidth={2}
                dot={{ fill: theme === 'dark' ? '#60a5fa' : '#3b82f6', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: theme === 'dark' ? '#60a5fa' : '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

export default DashboardPage