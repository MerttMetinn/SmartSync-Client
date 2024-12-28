import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Activity, DollarSign, Package, Users } from 'lucide-react'
import axiosInstance from '@/contexts/axiosInstance'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'

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

const DashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // İstatistikleri hesapla
  const totalProducts = products.length
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0)
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0)
  const lowStockProducts = products.filter(product => product.stock <= 10).length

  const stats = [
    {
      title: 'Toplam Ürün',
      value: totalProducts,
      icon: Package,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Toplam Stok',
      value: totalStock,
      icon: Activity,
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Toplam Değer',
      value: totalValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
      icon: DollarSign,
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Kritik Stok',
      value: lowStockProducts,
      icon: Users,
      trend: 'down',
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ]

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Hoş Geldiniz
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Günlük istatistikleriniz aşağıda listelenmiştir.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage