import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axiosInstance from '@/contexts/axiosInstance'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { Package2, Clock, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  createdDate: string
}

interface OrderProduct {
  id: string
  orderId: string
  productId: string
  quantity: number
  product: Product
}

interface Order {
  id: string
  customerId: string
  status: OrderStatus
  price: number
  createdDate: string
  orderProducts: OrderProduct[]
}

enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Error = 3
}

interface ApiResponse {
  response: {
    success: boolean
    message: string
    responseType: 'Success' | 'Error' | 'Warning' | 'Info'
  }
  orders: Order[]
}

const getStatusConfig = (status: OrderStatus): { color: string; icon: JSX.Element; text: string; bgColor: string; lightBg: string } => {
  switch (status) {
    case OrderStatus.Pending:
      return {
        color: 'text-yellow-700 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-400/10',
        lightBg: 'bg-yellow-100/50',
        icon: <Clock className="h-4 w-4" />,
        text: 'Beklemede'
      }
    case OrderStatus.Processing:
      return {
        color: 'text-blue-700 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-400/10',
        lightBg: 'bg-blue-100/50',
        icon: <RefreshCcw className="h-4 w-4" />,
        text: 'İşleniyor'
      }
    case OrderStatus.Completed:
      return {
        color: 'text-green-700 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-400/10',
        lightBg: 'bg-green-100/50',
        icon: <CheckCircle2 className="h-4 w-4" />,
        text: 'Tamamlandı'
      }
    case OrderStatus.Error:
      return {
        color: 'text-red-700 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-400/10',
        lightBg: 'bg-red-100/50',
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Hata'
      }
    default:
      return {
        color: 'text-gray-700 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-400/10',
        lightBg: 'bg-gray-100/50',
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Bilinmeyen Durum'
      }
  }
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const [sortConfig, setSortConfig] = useState<{
    key: 'createdDate' | 'price';
    direction: 'asc' | 'desc';
  }>({
    key: 'createdDate',
    direction: 'desc'
  })

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>('/api/Order/GetCustomerOrders')
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
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSort = (key: 'createdDate' | 'price') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false
    }
    return true
  }).sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1
    if (sortConfig.key === 'createdDate') {
      return (new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()) * direction
    }
    return (a.price - b.price) * direction
  })

  const getStatusCount = (status: OrderStatus) => {
    return orders.filter(order => order.status === status).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Siparişlerim</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Toplam {filteredOrders.length} sipariş
          </div>
        </div>

        {/* Durum Filtreleri */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className={`h-8 ${
              selectedStatus === 'all' 
                ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => setSelectedStatus('all')}
          >
            <span className="flex items-center gap-1">
              Tümü ({orders.length})
            </span>
          </Button>
          {Object.values(OrderStatus).filter(status => typeof status === 'number').map((status) => {
            const config = getStatusConfig(status as OrderStatus)
            const count = getStatusCount(status as OrderStatus)
            const isSelected = selectedStatus === status
            return (
              <Button
                key={status}
                variant="outline"
                size="sm"
                className={`h-8 ${
                  isSelected 
                    ? `${config.bgColor} ${config.color} border-${config.color} hover:${config.bgColor}`
                    : `hover:${config.lightBg}`
                }`}
                onClick={() => setSelectedStatus(status as OrderStatus)}
              >
                <span className="flex items-center gap-1">
                  {config.icon}
                  {config.text} ({count})
                </span>
              </Button>
            )
          })}
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="w-[10%] font-semibold">Sipariş No</TableHead>
                <TableHead 
                  className="w-[15%] font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('createdDate')}
                >
                  <div className="flex items-center gap-2">
                    Tarih
                    {sortConfig.key === 'createdDate' && (
                      <span className="text-xs">
                        {sortConfig.direction === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[10%] font-semibold">Saat</TableHead>
                <TableHead className="w-[35%] font-semibold">Ürünler</TableHead>
                <TableHead 
                  className="w-[15%] font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-2">
                    Toplam
                    {sortConfig.key === 'price' && (
                      <span className="text-xs">
                        {sortConfig.direction === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[15%] font-semibold">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Package2 className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {orders.length === 0 ? 'Henüz siparişiniz bulunmamaktadır.' : 'Filtrelere uygun sipariş bulunamadı.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  const orderDate = new Date(order.createdDate)
                  return (
                    <TableRow 
                      key={order.id} 
                      className="border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 dark:text-white">
                            #{order.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {orderDate.toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {orderDate.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.orderProducts?.map(op => (
                            `${op.product?.name || 'Bilinmeyen Ürün'} (${op.quantity} adet)`
                          )).join(', ') || 'Ürün bilgisi bulunamadı'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.price.toLocaleString('tr-TR', { 
                            style: 'currency', 
                            currency: 'TRY',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusConfig.color} ${statusConfig.bgColor}`}>
                          {statusConfig.icon}
                          {statusConfig.text}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

export default OrdersPage 