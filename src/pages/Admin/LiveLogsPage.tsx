import React from 'react'
import LiveLogPanel from '@/components/shared/Admin/LiveLogPanel'
import { motion } from 'framer-motion'

const LiveLogsPage: React.FC = () => {
  const getLogColor = (type: LogType) => {
    const colors = {
      [LogType.Error]: {
        light: 'bg-red-50 border-red-200 text-red-700',
        dark: 'dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400'
      },
      [LogType.Warning]: {
        light: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        dark: 'dark:bg-yellow-900/20 dark:border-yellow-800/30 dark:text-yellow-400'
      },
      [LogType.Information]: {
        light: 'bg-blue-50 border-blue-200 text-blue-700',
        dark: 'dark:bg-blue-900/20 dark:border-blue-800/30 dark:text-blue-400'
      },
      [LogType.Success]: {
        light: 'bg-green-50 border-green-200 text-green-700',
        dark: 'dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400'
      }
    }

    return `${colors[type].light} ${colors[type].dark}`
  }

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