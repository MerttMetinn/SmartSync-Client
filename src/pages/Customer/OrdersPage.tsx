import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type OrderStatus = 'bekliyor' | 'işleniyor' | 'tamamlandı' | 'iptal'

interface Order {
  id: number
  date: string
  products: string[]
  total: number
  status: OrderStatus
  priority: number
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'bekliyor':
      return 'bg-yellow-500'
    case 'işleniyor':
      return 'bg-blue-500'
    case 'tamamlandı':
      return 'bg-green-500'
    case 'iptal':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const OrdersPage = () => {
  const [orders] = useState<Order[]>([
    {
      id: 1001,
      date: '2024-03-15',
      products: ['Ürün A', 'Ürün B'],
      total: 1500,
      status: 'tamamlandı',
      priority: 1
    },
    {
      id: 1002,
      date: '2024-03-16',
      products: ['Ürün C'],
      total: 750,
      status: 'işleniyor',
      priority: 2
    },
    {
      id: 1003,
      date: '2024-03-17',
      products: ['Ürün D', 'Ürün E', 'Ürün F'],
      total: 2250,
      status: 'bekliyor',
      priority: 3
    }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Siparişlerim</h1>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-700 dark:text-gray-300">Sipariş No</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Tarih</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Ürünler</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Toplam</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Durum</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Öncelik Sırası</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="border-gray-200 dark:border-gray-700">
                <TableCell className="text-gray-900 dark:text-white">#{order.id}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{order.date}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">{order.products.join(', ')}</TableCell>
                <TableCell className="text-gray-900 dark:text-white">₺{order.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">{order.priority}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default OrdersPage 