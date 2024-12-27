import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Button } from "@/components/ui/button"
import { Package2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProductDetail {
  productId: number
  name: string
  quantity: number
  price: number
}

interface LogEntry {
  id: number
  customerId: number
  customerType: 'Premium' | 'Standard'
  logType: 'Hata' | 'Bilgi' | 'Uyarı'
  products: ProductDetail[]
  timestamp: string
  result: string
  totalAmount: number
}

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [checkInterval, setCheckInterval] = useState<number>(3)
  const [logProbability, setLogProbability] = useState<number>(30)
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true)
  
  // Filtreleme state'leri
  const [selectedLogType, setSelectedLogType] = useState<'Hata' | 'Bilgi' | 'Uyarı' | 'Tümü'>('Tümü')
  const [selectedCustomerType, setSelectedCustomerType] = useState<'Premium' | 'Standard' | 'Tümü'>('Tümü')
  const [selectedResult, setSelectedResult] = useState<'Başarılı' | 'Başarısız' | 'Tümü'>('Tümü')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    end: new Date().toISOString()
  })

  // Filtrelenmiş logları hesapla
  const filteredLogs = logs.filter(log => {
    const matchesLogType = selectedLogType === 'Tümü' || log.logType === selectedLogType
    const matchesCustomerType = selectedCustomerType === 'Tümü' || log.customerType === selectedCustomerType
    const matchesResult = selectedResult === 'Tümü' || 
      (selectedResult === 'Başarılı' ? log.result === 'Satın alma başarılı' : log.result !== 'Satın alma başarılı')
    const logDate = new Date(log.timestamp)
    const matchesDate = logDate >= new Date(dateRange.start) && logDate <= new Date(dateRange.end)

    return matchesLogType && matchesCustomerType && matchesResult && matchesDate
  })

  // Mock veri oluşturan fonksiyon
  const generateMockLog = (): LogEntry => {
    const logTypes: Array<'Hata' | 'Bilgi' | 'Uyarı'> = ['Hata', 'Bilgi', 'Uyarı']
    const results = [
      'Satın alma başarılı',
      'Ürün stoğu yetersiz',
      'Zaman aşımı',
      'Müşteri bakiyesi yetersiz',
      'Veritabanı Hatası'
    ]
    
    const selectedLogType = logTypes[Math.floor(Math.random() * logTypes.length)]
    const isSuccess = Math.random() > 0.3 // %70 başarı oranı
    
    // Rastgele 1-4 arası ürün oluştur
    const productCount = Math.floor(Math.random() * 3) + 1
    const products: ProductDetail[] = Array.from({ length: productCount }, (_, index) => ({
      productId: Math.floor(Math.random() * 1000),
      name: `Ürün ${index + 1}`,
      quantity: Math.floor(Math.random() * 5) + 1,
      price: Math.floor(Math.random() * 1000) + 100
    }))
    
    const totalAmount = products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
    
    return {
      id: Math.floor(Math.random() * 1000),
      customerId: Math.floor(Math.random() * 100),
      customerType: Math.random() > 0.5 ? 'Premium' : 'Standard',
      logType: selectedLogType,
      products,
      timestamp: new Date().toISOString(),
      result: isSuccess ? 'Satın alma başarılı' : results[Math.floor(Math.random() * (results.length - 1)) + 1],
      totalAmount
    }
  }

  useEffect(() => {
    // İlk yükleme için mock veriler
    setLogs([...Array(5)].map(() => generateMockLog()))

    if (!isAutoRefresh) return

    // Her checkInterval saniyede bir yeni log kontrolü
    const interval = setInterval(() => {
      if (Math.random() * 100 < logProbability) { // logProbability% ihtimalle yeni log eklenir
        setLogs(prevLogs => [generateMockLog(), ...prevLogs.slice(0, 49)]) // Max 50 log göster
      }
    }, checkInterval * 1000)

    return () => clearInterval(interval)
  }, [checkInterval, logProbability, isAutoRefresh])

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'Hata':
        return 'bg-red-500 text-white dark:bg-red-600 dark:text-red-100'
      case 'Uyarı':
        return 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-yellow-100'
      case 'Bilgi':
        return 'bg-blue-500 text-white dark:bg-blue-600 dark:text-blue-100'
      default:
        return 'bg-gray-500 text-white dark:bg-gray-600 dark:text-gray-100'
    }
  }

  const getResultColor = (result: string) => {
    return result === 'Satın alma başarılı' 
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">
          Sistem Logları
        </h1>
        <Badge 
          variant="outline" 
          className="px-4 py-1.5 text-sm font-medium bg-white/10 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
        >
          Son Güncelleme: {format(new Date(), 'HH:mm:ss', { locale: tr })}
        </Badge>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Log Kontrol Paneli</h2>
            <Button
              variant={isAutoRefresh ? "default" : "secondary"}
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className="w-40"
            >
              {isAutoRefresh ? "Otomatik Yenileme Açık" : "Otomatik Yenileme Kapalı"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Kontrol Sıklığı (saniye)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={checkInterval}
                onChange={(e) => setCheckInterval(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>1s</span>
                <span>{checkInterval}s</span>
                <span>10s</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Yeni Log Olasılığı (%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={logProbability}
                onChange={(e) => setLogProbability(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>0%</span>
                <span>{logProbability}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Filtreleme</h2>
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Log Türü
              </label>
              <select
                value={selectedLogType}
                onChange={(e) => setSelectedLogType(e.target.value as typeof selectedLogType)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="Tümü">Tümü</option>
                <option value="Hata">Hata</option>
                <option value="Bilgi">Bilgi</option>
                <option value="Uyarı">Uyarı</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Müşteri Türü
              </label>
              <select
                value={selectedCustomerType}
                onChange={(e) => setSelectedCustomerType(e.target.value as typeof selectedCustomerType)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="Tümü">Tümü</option>
                <option value="Premium">Premium</option>
                <option value="Standard">Standard</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Sonuç
              </label>
              <select
                value={selectedResult}
                onChange={(e) => setSelectedResult(e.target.value as typeof selectedResult)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="Tümü">Tümü</option>
                <option value="Başarılı">Başarılı</option>
                <option value="Başarısız">Başarısız</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tarih Aralığı
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="datetime-local"
                  value={dateRange.start.slice(0, 16)}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value).toISOString() }))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
                <input
                  type="datetime-local"
                  value={dateRange.end.slice(0, 16)}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value).toISOString() }))}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="border-0 shadow-lg bg-white dark:bg-gray-900/90 rounded-xl overflow-hidden border-gray-200 dark:border-gray-700/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                <TableHead className="py-4 px-6 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Log ID</TableHead>
                <TableHead className="py-4 px-6 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Müşteri ID</TableHead>
                <TableHead className="py-4 px-6 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Müşteri Türü</TableHead>
                <TableHead className="py-4 px-6 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Log Türü</TableHead>
                <TableHead className="py-4 px-6 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Zaman</TableHead>
                <TableHead className="py-4 px-6 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">Sonuç</TableHead>
                <TableHead className="py-4 px-6 text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider text-right">Detay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log, index) => (
                <TableRow 
                  key={log.id} 
                  className={`
                    border-b border-gray-200 dark:border-gray-700/50 last:border-0
                    ${index % 2 === 0 
                      ? 'bg-white dark:bg-gray-900/90' 
                      : 'bg-gray-50/50 dark:bg-gray-800/80'
                    }
                    hover:bg-gray-100/80 dark:hover:bg-gray-800/90 transition-colors
                  `}
                >
                  <TableCell className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-gray-100">{log.id}</TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{log.customerId}</TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge 
                      variant={log.customerType === 'Premium' ? 'default' : 'secondary'}
                      className={`
                        px-3 py-1 text-xs font-medium rounded-full
                        ${log.customerType === 'Premium' 
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}
                      `}
                    >
                      {log.customerType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge 
                      className={`
                        ${getLogTypeColor(log.logType)} 
                        px-3 py-1 text-xs font-medium rounded-full shadow-sm
                      `}
                    >
                      {log.logType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                    {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: tr })}
                  </TableCell>
                  <TableCell className={`py-4 px-6 text-sm font-medium ${getResultColor(log.result)}`}>
                    {log.result}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <Package2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700/50 shadow-xl rounded-xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                            Sipariş Detayları
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 items-center gap-4">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Log ID:</span>
                            <span className="text-gray-800 dark:text-gray-100">{log.id}</span>
                          </div>
                          
                          <div className="space-y-2">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Ürünler:</span>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50/80 dark:bg-gray-800/80">
                                    <TableHead className="text-xs">Ürün</TableHead>
                                    <TableHead className="text-xs text-right">Miktar</TableHead>
                                    <TableHead className="text-xs text-right">Fiyat</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {log.products.map((product) => (
                                    <TableRow key={product.productId} className="border-b border-gray-200 dark:border-gray-700/50 last:border-0">
                                      <TableCell className="text-sm text-gray-800 dark:text-gray-200">
                                        {product.name}
                                      </TableCell>
                                      <TableCell className="text-sm text-right text-gray-800 dark:text-gray-200">
                                        {product.quantity}
                                      </TableCell>
                                      <TableCell className="text-sm text-right text-gray-800 dark:text-gray-200">
                                        {product.price.toLocaleString('tr-TR', { 
                                          style: 'currency', 
                                          currency: 'TRY',
                                          minimumFractionDigits: 2
                                        })}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  <TableRow className="bg-gray-50/80 dark:bg-gray-800/80 font-medium">
                                    <TableCell colSpan={2} className="text-sm text-gray-700 dark:text-gray-300">
                                      Toplam Tutar:
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-gray-900 dark:text-white font-semibold">
                                      {log.totalAmount.toLocaleString('tr-TR', { 
                                        style: 'currency', 
                                        currency: 'TRY',
                                        minimumFractionDigits: 2
                                      })}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 items-center gap-4">
                            <span className="font-medium text-gray-600 dark:text-gray-300">İşlem Zamanı:</span>
                            <span className="text-gray-800 dark:text-gray-100">
                              {format(new Date(log.timestamp), 'dd MMM yyyy HH:mm:ss', { locale: tr })}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 items-center gap-4">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Sonuç:</span>
                            <span className={`font-medium ${
                              log.result === 'Satın alma başarılı'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {log.result}
                            </span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

export default LogsPage 