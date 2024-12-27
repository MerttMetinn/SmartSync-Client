import React, { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface LogItem {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  timestamp: Date
  customerId: number
  customerType: 'premium' | 'normal'
  details?: {
    products?: Array<{
      productId: number
      productName: string
      quantity: number
    }>
    status?: string
  }
}

const LiveLogPanel: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  // Mock veri üretimi için örnek fonksiyon
  const generateMockLog = (): LogItem => {
    const customers = [
      { id: 1, type: 'premium' },
      { id: 2, type: 'normal' },
      { id: 3, type: 'premium' },
      { id: 4, type: 'normal' }
    ]
    const products = [
      { id: 1, name: 'Product1' },
      { id: 2, name: 'Product2' },
      { id: 3, name: 'Product3' },
      { id: 4, name: 'Product4' },
      { id: 5, name: 'Product5' }
    ]
    const logTypes = ['info', 'success', 'error', 'warning'] as const
    
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.floor(Math.random() * 100) + 1
    const type = logTypes[Math.floor(Math.random() * logTypes.length)]
    
    let message = ''
    let details = {}
    
    switch (type) {
      case 'info':
        message = `Müşteri ${customer.id} (${customer.type}) ${product.name}'den ${quantity} adet sipariş verdi.`
        details = {
          products: [{ productId: product.id, productName: product.name, quantity }],
          status: 'Sipariş Verildi'
        }
        break
      case 'success':
        message = `Müşteri ${customer.id} (${customer.type}) siparişi onaylandı.`
        details = { status: 'Onaylandı' }
        break
      case 'error':
        message = `Müşteri ${customer.id} (${customer.type}) siparişi stok yetersizliğinden iptal edildi.`
        details = { status: 'İptal Edildi' }
        break
      case 'warning':
        message = `Müşteri ${customer.id} (${customer.type}) siparişi işleme alındı.`
        details = { status: 'İşleme Alındı' }
        break
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date(),
      customerId: customer.id,
      customerType: customer.type as 'premium' | 'normal',
      details
    }
  }

  useEffect(() => {
    // İlk yükleme için 5 log oluştur
    setLogs([...Array(5)].map(generateMockLog))

    // Her 2-5 saniye arasında yeni log ekle
    const interval = setInterval(() => {
      setLogs(prevLogs => [generateMockLog(), ...prevLogs.slice(0, 49)]) // Max 50 log tut
    }, Math.random() * 3000 + 2000)

    return () => clearInterval(interval)
  }, [])

  // Yeni log eklendiğinde otomatik scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [logs])

  const getLogTypeStyles = (type: LogItem['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800/30'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30'
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/30'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/30'
    }
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Canlı Log Akışı</h2>
      </div>
      
      <ScrollArea className="h-[600px]" ref={scrollRef}>
        <div className="p-4 space-y-3">
          {logs.map(log => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border ${getLogTypeStyles(log.type)} transition-colors duration-200`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge 
                  variant="outline" 
                  className={`${log.customerType === 'premium' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}
                >
                  Müşteri {log.customerId} ({log.customerType})
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {format(log.timestamp, 'HH:mm:ss', { locale: tr })}
                </span>
              </div>
              <p className="text-sm">{log.message}</p>
              {log.details?.products && (
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Ürünler: {log.details.products.map(p => 
                    `${p.productName} (${p.quantity} adet)`
                  ).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}

export default LiveLogPanel 