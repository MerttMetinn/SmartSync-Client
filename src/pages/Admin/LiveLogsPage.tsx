import React from 'react'
import LiveLogPanel from '@/components/shared/Admin/LiveLogPanel'

const LiveLogsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Canlı Log Akışı
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Sistemdeki tüm işlemlerin gerçek zamanlı akışını görüntüleyin
        </p>
      </div>
      
      <LiveLogPanel />
    </div>
  )
}

export default LiveLogsPage 