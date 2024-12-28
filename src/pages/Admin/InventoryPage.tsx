import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import axiosInstance from '@/contexts/axiosInstance'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface Product {
  id: string
  name: string
  stock: number
  price: number
  createdDate: string
}

interface PaginatedResponse {
  response: {
    success: boolean
    message: string
    responseType: 'Success' | 'Error' | 'Warning' | 'Info'
  }
  products: Product[]
}

// Stok durumu için renk belirleme fonksiyonu
const getStockColor = (stock: number) => {
  if (stock <= 10) return '#ef4444' // Kritik seviye - Kırmızı
  if (stock <= 20) return '#f97316' // Uyarı seviyesi - Turuncu
  return '#22c55e' // Normal seviye - Yeşil
}

const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>([])

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get<PaginatedResponse>('/api/Product/GetProducts')
      if (response.data.response.success) {
        setProducts(response.data.products)
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Ürünler getirilirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Ürünler yüklenirken bir hata oluştu')
      }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Grafik verilerini hazırla
  const chartData = products.map(product => ({
    name: product.name,
    stock: product.stock,
    color: getStockColor(product.stock)
  }))

  // Pasta grafik için veri hazırlama
  const pieData = products.reduce((acc, product) => {
    const stockLevel = product.stock <= 10 ? 'Kritik' : product.stock <= 20 ? 'Uyarı' : 'Normal'
    const existing = acc.find(item => item.name === stockLevel)
    if (existing) {
      existing.value++
    } else {
      acc.push({ name: stockLevel, value: 1 })
    }
    return acc
  }, [] as { name: string; value: number }[])

  const STOCK_COLORS = {
    Kritik: '#ef4444',
    Uyarı: '#f97316',
    Normal: '#22c55e'
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Stok Durumu
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Grafik */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Ürün Stok Seviyeleri
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ccc'
                  }}
                />
                <Legend />
                <Bar dataKey="stock" name="Stok Miktarı">
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pasta Grafik */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Stok Durumu Dağılımı
          </h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STOCK_COLORS[entry.name as keyof typeof STOCK_COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Stok Durumu Tablosu */}
        <Card className="p-6 bg-white dark:bg-gray-800 lg:col-span-2">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Kritik Stok Seviyeleri
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Ürün Adı</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Stok</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Durum</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(product => product.stock <= 20)
                  .sort((a, b) => a.stock - b.stock)
                  .map(product => (
                    <tr 
                      key={product.id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900 dark:text-white">
                        {product.stock}
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${product.stock <= 10 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}
                        >
                          {product.stock <= 10 ? 'Kritik' : 'Uyarı'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default InventoryPage 