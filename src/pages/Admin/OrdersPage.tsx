import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { Package2, Clock, AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react'
import axiosInstance from '@/contexts/axiosInstance'
import { AxiosError } from 'axios'

enum OrderStatus {
  Pending = 0,
  QueuedForProcessing = 1,
  ValidatingOrder = 2,
  CheckingStock = 3,
  ProcessingPayment = 4,
  UpdatingInventory = 5,
  Completed = 6,
  Error = 7
}

interface Order {
  id: string
  customerId: string
  status: number
  price: number
  customer: {
    username: string
    type: 'Normal' | 'Premium'
    budget: number
    totalSpent: number
  } | null
  orderProducts: {
    productId: string
    quantity: number
  }[] | null
  createdDate: string
}

interface ApiResponse {
  response: {
    success: boolean
    message: string
    responseType: 'Success' | 'Error' | 'Warning' | 'Info'
  }
  orders: Order[]
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedStatus, setSelectedStatus] = useState<number | 'all'>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>('/api/Order/GetOrders')
      if (response.data.response.success) {
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Siparişler getirilirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Siparişler yüklenirken bir hata oluştu')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startPolling = () => {
    // Her 500ms'de bir siparişleri güncelle (daha sık güncelleme için)
    const interval = setInterval(fetchOrders, 500)
    setPollingInterval(interval)
  }

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }

  const handleProcessOrders = async () => {
    setIsProcessing(true)
    try {
      const response = await axiosInstance.post<ApiResponse>('/api/Order/ProcessOrders', {}, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (response.data.response.success) {
        toast.success('Siparişler işleme alındı')
        startPolling()
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Siparişler işlenirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Siparişler işlenirken bir hata oluştu')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    fetchOrders()

    // Component unmount olduğunda polling'i durdur
    return () => {
      stopPolling()
    }
  }, [])

  // Bekleyen sipariş kalmadığında polling'i durdur
  useEffect(() => {
    if (!orders.some(order => 
      order.status > OrderStatus.Pending && 
      order.status < OrderStatus.Completed
    )) {
      stopPolling()
    } else {
      // Eğer işlenen sipariş varsa ve polling aktif değilse, polling'i başlat
      if (!pollingInterval) {
        startPolling()
      }
    }
  }, [orders, pollingInterval])

  const getStatusText = (status: number) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'Beklemede'
      case OrderStatus.QueuedForProcessing:
        return 'Sıraya Alındı'
      case OrderStatus.ValidatingOrder:
        return 'Doğrulanıyor'
      case OrderStatus.CheckingStock:
        return 'Stok Kontrolü'
      case OrderStatus.ProcessingPayment:
        return 'Ödeme İşleniyor'
      case OrderStatus.UpdatingInventory:
        return 'Stok Güncelleniyor'
      case OrderStatus.Completed:
        return 'Tamamlandı'
      case OrderStatus.Error:
        return 'Hata'
      default:
        return 'Bilinmiyor'
    }
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case OrderStatus.QueuedForProcessing:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case OrderStatus.ValidatingOrder:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case OrderStatus.CheckingStock:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400'
      case OrderStatus.ProcessingPayment:
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
      case OrderStatus.UpdatingInventory:
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
      case OrderStatus.Completed:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case OrderStatus.Error:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getProgressPercentage = (status: number) => {
    switch (status) {
      case OrderStatus.Pending:
        return 0
      case OrderStatus.QueuedForProcessing:
        return 16.66
      case OrderStatus.ValidatingOrder:
        return 33.33
      case OrderStatus.CheckingStock:
        return 50
      case OrderStatus.ProcessingPayment:
        return 66.66
      case OrderStatus.UpdatingInventory:
        return 83.33
      case OrderStatus.Completed:
        return 100
      case OrderStatus.Error:
        return 100
      default:
        return 0
    }
  }

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length
  }

  const stats = [
    {
      title: 'Toplam Sipariş',
      count: orders.length,
      icon: Package2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Bekleyen',
      count: getStatusCount(OrderStatus.Pending),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      title: 'İşleniyor',
      count: orders.filter(order => 
        order.status > OrderStatus.Pending && 
        order.status < OrderStatus.Completed
      ).length,
      icon: AlertCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Tamamlanan',
      count: getStatusCount(OrderStatus.Completed),
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    }
  ]

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus)

  if (isLoading) {
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Sipariş Yönetimi
        </h1>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={fetchOrders}
        >
          <RefreshCcw className="h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* İstatistik Kartları */}
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
                  {stat.count}
                </h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtreler ve İşlem Butonu */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedStatus('all')}
          >
            Tümü
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.Pending ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.Pending)}
          >
            Bekleyen
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.QueuedForProcessing ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.QueuedForProcessing)}
          >
            Sıraya Alındı
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.ValidatingOrder ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.ValidatingOrder)}
          >
            Doğrulanıyor
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.CheckingStock ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.CheckingStock)}
          >
            Stok Kontrolü
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.ProcessingPayment ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.ProcessingPayment)}
          >
            Ödeme İşleniyor
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.UpdatingInventory ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.UpdatingInventory)}
          >
            Stok Güncelleniyor
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.Completed ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.Completed)}
          >
            Tamamlandı
          </Button>
          <Button
            variant={selectedStatus === OrderStatus.Error ? 'default' : 'outline'}
            onClick={() => setSelectedStatus(OrderStatus.Error)}
          >
            Hatalı
          </Button>
        </div>

        <Button
          disabled={isProcessing || !orders.some(order => order.status === OrderStatus.Pending)}
          onClick={handleProcessOrders}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isProcessing ? 'İşleniyor...' : 'Siparişleri Onayla'}
        </Button>
      </div>

      {/* Sipariş Tablosu */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Sipariş No</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Müşteri ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Tutar</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Durum</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border-b border-gray-200 dark:border-gray-700 ${
                    order.status > OrderStatus.Pending && order.status < OrderStatus.Completed
                      ? 'bg-blue-50/50 dark:bg-blue-900/10'
                      : ''
                  }`}
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    #{order.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {order.customerId}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {order.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-2">
                      <motion.span
                        initial={false}
                        animate={{
                          backgroundColor: getStatusColor(order.status).includes('bg-') 
                            ? getStatusColor(order.status).split(' ')[0] 
                            : undefined
                        }}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </motion.span>
                      {order.status !== OrderStatus.Pending && order.status !== OrderStatus.Completed && order.status !== OrderStatus.Error && (
                        <div className="relative w-full h-3">
                          <div className="absolute w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                              initial={false}
                              animate={{ 
                                width: `${getProgressPercentage(order.status)}%`,
                                transition: { duration: 0.3, ease: "easeInOut" }
                              }}
                            />
                          </div>
                          <div className="absolute w-full h-full rounded-full opacity-20 animate-pulse bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                          <div className="absolute -right-7 -top-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {Math.round(getProgressPercentage(order.status))}%
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {new Date(order.createdDate).toLocaleString('tr-TR')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default OrdersPage 