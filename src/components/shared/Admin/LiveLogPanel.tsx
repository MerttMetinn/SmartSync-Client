import React, { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, AlertTriangle, Info, Search, Filter, CheckCircle2 } from 'lucide-react'
import axiosInstance from '@/contexts/axiosInstance'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

enum LogType {
  Error = 0,
  Warning = 1,
  Information = 2,
  Success = 3
}

interface Log {
  id: string
  customerId: string
  orderId: string
  type: LogType
  details: string
  createdDate: string
}

interface ApiResponse {
  response: {
    success: boolean
    message: string
    responseType: 'Success' | 'Error' | 'Warning' | 'Info'
  }
  logs: Log[]
}

const LiveLogPanel: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([])
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>('/api/Log/GetLogs')
      if (response.data.response.success) {
        setLogs(response.data.logs)
        filterLogs(response.data.logs, searchTerm, selectedType)
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Loglar getirilirken hata oluştu:', error)
        toast.error(error.response?.data?.message || 'Loglar yüklenirken bir hata oluştu')
      }
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, selectedType])

  useEffect(() => {
    fetchLogs()
    let interval: NodeJS.Timeout | null = null
    
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchLogs, autoRefresh])

  const filterLogs = (logs: Log[], search: string, type: string) => {
    let filtered = [...logs]

    // Tip filtreleme
    if (type !== 'all') {
      filtered = filtered.filter(log => log.type === Number(type))
    }

    // Arama filtreleme
    if (search) {
      filtered = filtered.filter(log => 
        log.details.toLowerCase().includes(search.toLowerCase()) ||
        log.orderId.toLowerCase().includes(search.toLowerCase()) ||
        log.customerId.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Tarihe göre sırala (en yeni en üstte)
    filtered.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())

    setFilteredLogs(filtered)
  }

  useEffect(() => {
    filterLogs(logs, searchTerm, selectedType)
  }, [logs, searchTerm, selectedType])

  const getLogIcon = (type: LogType) => {
    switch (type) {
      case LogType.Error:
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case LogType.Warning:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case LogType.Information:
        return <Info className="h-5 w-5 text-blue-500" />
      case LogType.Success:
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    }
  }

  const getLogColor = (type: LogType) => {
    switch (type) {
      case LogType.Error:
        return 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow duration-200'
      case LogType.Warning:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800 shadow-sm hover:shadow-md transition-shadow duration-200'
      case LogType.Information:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow duration-200'
      case LogType.Success:
        return 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md transition-shadow duration-200'
    }
  }

  if (isLoading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </Card>
    )
  }

  return (
    <Card className="h-[650px] overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Canlı Loglar</h2>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-blue-50' : ''}
          >
            {autoRefresh ? 'Otomatik Yenileme Açık' : 'Otomatik Yenileme Kapalı'}
          </Button>
        </div>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Log ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select
            value={selectedType}
            onValueChange={setSelectedType}
          >
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="Log tipi seçin" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectItem value="all">Tüm Loglar</SelectItem>
              <SelectItem value="0" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                Hata
              </SelectItem>
              <SelectItem value="1" className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                Uyarı
              </SelectItem>
              <SelectItem value="2" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                Bilgi
              </SelectItem>
              <SelectItem value="3" className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                Başarılı
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[550px]">
        <div className="p-4 pb-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`p-4 rounded-lg border backdrop-blur-sm ${getLogColor(log.type)} flex items-start gap-3`}
              >
                {getLogIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {log.details}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                      {new Date(log.createdDate).toLocaleString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      Sipariş: #{log.orderId.slice(0, 8)}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/20 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                      Müşteri: #{log.customerId.slice(0, 8)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.createdDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  )
}

export default LiveLogPanel 