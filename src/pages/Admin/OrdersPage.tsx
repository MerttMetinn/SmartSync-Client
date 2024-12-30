import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertCircle, CheckCircle2, RefreshCcw, Loader2, X, Eye, Search } from 'lucide-react'
import axiosInstance from '@/contexts/axiosInstance'
import { AxiosError } from 'axios'
import { Input } from '@/components/ui/input'

enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Error = 3
}

interface Customer {
  id: string
  username: string
  type: number 
  budget: number
  totalSpent: number
}

interface OrderProduct {
  productId: string
  quantity: number
  product: Product
}

interface Order {
  id: string
  customerId: string
  status: number
  price: number
  customer: Customer | null
  orderProducts: OrderProduct[] | null
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

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface FilterState {
  search: string
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedStatus, setSelectedStatus] = useState<number | 'all'>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDrawerLoading, setIsDrawerLoading] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: ''
  })

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>('/api/Order/GetOrders')
      if (response.data.response.success) {
        const newOrders = response.data.orders
        
        const newCustomerIds = new Set(
          newOrders
            .filter(order => !order.customer)
            .map(order => order.customerId)
        )

        if (newCustomerIds.size > 0) {
          const customerPromises = Array.from(newCustomerIds).map(async (customerId) => {
            try {
              const response = await axiosInstance.get<{
                response: { success: boolean; message: string }
                customer: Customer
              }>(`/api/Customer/GetCustomerById/${customerId}`)
              return response.data.response.success ? response.data.customer : null
            } catch (error) {
              console.error(`Müşteri bilgisi alınamadı (ID: ${customerId}):`, error)
              return null
            }
          })

          const customers = await Promise.all(customerPromises)
          const customerMap = new Map(
            customers
              .filter((c): c is Customer => c !== null)
              .map(customer => [customer.id, customer])
          )

          const ordersWithCustomers = newOrders.map(order => ({
            ...order,
            customer: customerMap.get(order.customerId) || order.customer
          }))

          setOrders(ordersWithCustomers)
        } else {
          setOrders(newOrders)
        }
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
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 3000)
    return () => clearInterval(interval)
  }, [fetchOrders])

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
        await fetchOrders()
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

  const getStatusText = (status: number) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'Beklemede'
      case OrderStatus.Processing:
        return 'İşleniyor'
      case OrderStatus.Completed:
        return 'Tamamlandı'
      case OrderStatus.Error:
        return 'Hata'
      default:
        return 'Bilinmiyor'
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      [OrderStatus.Pending]: {
        light: 'bg-yellow-100 text-yellow-800',
        dark: 'dark:bg-yellow-900/30 dark:text-yellow-400'
      },
      [OrderStatus.Processing]: {
        light: 'bg-blue-100 text-blue-800',
        dark: 'dark:bg-blue-900/30 dark:text-blue-400'
      },
      [OrderStatus.Completed]: {
        light: 'bg-green-100 text-green-800',
        dark: 'dark:bg-green-900/30 dark:text-green-400'
      },
      [OrderStatus.Error]: {
        light: 'bg-red-100 text-red-800',
        dark: 'dark:bg-red-900/30 dark:text-red-400'
      }
    }

    return `${colors[status].light} ${colors[status].dark}`
  }

  const getProgressPercentage = (status: number) => {
    switch (status) {
      case OrderStatus.Pending:
        return 0
      case OrderStatus.Processing:
        return 50
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

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter(order => order.status === selectedStatus)

  const getFilteredOrders = useCallback(() => {
    return filteredOrders.filter(order => {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        order.customer?.username.toLowerCase().includes(searchLower) ||
        String(order.price).includes(searchLower)

      return matchesSearch
    })
  }, [filteredOrders, filters])

  const finalOrders = getFilteredOrders().sort((a, b) => {
    const dateA = new Date(a.createdDate).getTime()
    const dateB = new Date(b.createdDate).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const handleOrderClick = async (order: Order) => {
    setSelectedOrder(order)
    setIsDrawerLoading(true)
    setIsDrawerLoading(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sipariş Yönetimi
        </h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleProcessOrders}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isProcessing ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Bekleyen Siparişleri Onayla {getStatusCount(OrderStatus.Pending) > 0 && `(${getStatusCount(OrderStatus.Pending)})`}</span>
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={fetchOrders}
          >
            <RefreshCcw className="h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-96">
              <Input
                type="text"
                placeholder="Sipariş no, müşteri adı veya tutar ile ara..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedStatus('all')}
                className="relative"
              >
                <span>Tümü</span>
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {orders.length}
                </span>
              </Button>
              {Object.values(OrderStatus).filter(v => typeof v === 'number').map((status: number) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus(status)}
                  className={`relative ${selectedStatus === status ? '' : getStatusColor(status as OrderStatus)}`}
                >
                  <div className="flex items-center gap-2">
                    {status === OrderStatus.Pending && <Clock className="h-4 w-4" />}
                    {status === OrderStatus.Processing && <RefreshCcw className="h-4 w-4" />}
                    {status === OrderStatus.Completed && <CheckCircle2 className="h-4 w-4" />}
                    {status === OrderStatus.Error && <AlertCircle className="h-4 w-4" />}
                    <span>{getStatusText(status)}</span>
                  </div>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {getStatusCount(status as OrderStatus)}
                  </span>
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
              <select
                className="bg-transparent border-none text-sm focus:outline-none text-gray-900 dark:text-gray-100"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <option value="desc">En Yeni</option>
                <option value="asc">En Eski</option>
              </select>
            </div>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={fetchOrders}
            >
              <RefreshCcw className="h-4 w-4" />
              Yenile
            </Button>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Toplam {finalOrders.length} sonuç bulundu
      </div>

      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Müşteri Bilgileri
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence>
                {finalOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                      order.status === OrderStatus.Processing
                        ? 'bg-blue-50/50 dark:bg-blue-900/10'
                        : ''
                    }`}
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.customer?.username || 'Bilinmeyen Müşteri'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.customer?.type === 1 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              Premium Üye
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                              Normal Üye
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          {order.status === OrderStatus.Pending && (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          {order.status === OrderStatus.Processing && (
                            <RefreshCcw className="h-4 w-4 text-blue-500 animate-spin" />
                          )}
                          {order.status === OrderStatus.Completed && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                          {order.status === OrderStatus.Error && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <motion.span
                            initial={false}
                            animate={{
                              backgroundColor: getStatusColor(order.status).includes('bg-') 
                                ? getStatusColor(order.status).split(' ')[0] 
                                : undefined
                            }}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              order.status as OrderStatus
                            )}`}
                          >
                            {getStatusText(order.status)}
                          </motion.span>
                        </div>
                        {order.status === OrderStatus.Processing && (
                          <div className="relative w-full h-2 mt-2">
                            <div className="absolute w-full h-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                initial={{ width: "0%" }}
                                animate={{ 
                                  width: `${getProgressPercentage(order.status)}%`,
                                }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                              />
                            </div>
                            <motion.div
                              className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                              animate={{
                                x: ["-100%", "100%"],
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(order.createdDate).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.createdDate).toLocaleTimeString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOrderClick(order)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span>Detay</span>
                        </Button>
                        {order.status === OrderStatus.Pending && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            Onay Bekliyor
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sipariş Detay Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black cursor-pointer"
              onClick={() => setSelectedOrder(null)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 right-0 w-1/3 h-full bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sipariş Detayları
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedOrder(null)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>

                {isDrawerLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Sipariş Bilgileri</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Sipariş No:</span>
                          <span className="font-medium">#{selectedOrder.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tarih:</span>
                          <span className="font-medium">
                            {new Date(selectedOrder.createdDate).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Durum:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            selectedOrder.status as OrderStatus
                          )}`}>
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Toplam Tutar:</span>
                          <span className="font-medium">
                            {selectedOrder.price.toLocaleString('tr-TR', { 
                              style: 'currency', 
                              currency: 'TRY' 
                            })}
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Müşteri Bilgileri</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Müşteri Adı:</span>
                          <span className="font-medium">
                            {selectedOrder.customer?.username || 'Bilinmeyen Müşteri'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Üyelik Tipi:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            selectedOrder.customer?.type === 1
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {selectedOrder.customer?.type === 1 ? 'Premium Üye' : 'Normal Üye'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Bütçe:</span>
                          <span className="font-medium">
                            {selectedOrder.customer?.budget.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Toplam Harcama:</span>
                          <span className="font-medium">
                            {selectedOrder.customer?.totalSpent.toLocaleString('tr-TR', {
                              style: 'currency',
                              currency: 'TRY'
                            })}
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Sipariş Ürünleri</h3>
                      <div className="space-y-4">
                        {selectedOrder.orderProducts?.map((orderProduct) => (
                          <div
                            key={orderProduct.productId}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {orderProduct.product.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Birim Fiyat: {orderProduct.product.price.toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {orderProduct.quantity} Adet
                              </span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Toplam: {(orderProduct.quantity * orderProduct.product.price).toLocaleString('tr-TR', {
                                  style: 'currency',
                                  currency: 'TRY'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrdersPage

