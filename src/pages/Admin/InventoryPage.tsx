import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Product {
  id: string
  name: string
  stock: number
  price: number
  criticalStock: number // Kritik stok seviyesi
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444'] // Yeşil, Sarı, Kırmızı

const InventoryPage = () => {
  // Mock veri
  const [products] = useState<Product[]>([
    { id: '1', name: 'Ürün 1', stock: 25, price: 100, criticalStock: 10 },
    { id: '2', name: 'Ürün 2', stock: 8, price: 150, criticalStock: 15 },
    { id: '3', name: 'Ürün 3', stock: 50, price: 200, criticalStock: 20 },
    { id: '4', name: 'Ürün 4', stock: 5, price: 300, criticalStock: 10 },
    { id: '5', name: 'Ürün 5', stock: 15, price: 250, criticalStock: 12 },
  ])

  // Stok durumuna göre renk belirleme
  const getStockColor = (stock: number, criticalStock: number) => {
    if (stock <= criticalStock / 2) return COLORS[2] // Kırmızı
    if (stock <= criticalStock) return COLORS[1] // Sarı
    return COLORS[0] // Yeşil
  }

  // Pasta grafik için veri hazırlama
  const pieData = [
    { name: 'Yeterli Stok', value: products.filter(p => p.stock > p.criticalStock).length },
    { name: 'Kritik Stok', value: products.filter(p => p.stock <= p.criticalStock && p.stock > p.criticalStock / 2).length },
    { name: 'Düşük Stok', value: products.filter(p => p.stock <= p.criticalStock / 2).length }
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Stok Durumu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ürünlerin stok durumlarını ve istatistiklerini görüntüleyin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Grafik */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Ürün Stok Seviyeleri</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="stock">
                  {products.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getStockColor(entry.stock, entry.criticalStock)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pasta Grafik */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Stok Durumu Dağılımı</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Ürün Tablosu */}
      <Card className="bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-700 dark:text-gray-300">Ürün Adı</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300 text-right">Stok</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300 text-right">Kritik Seviye</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300 text-right">Fiyat</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-gray-200 dark:border-gray-700">
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  {product.name}
                </TableCell>
                <TableCell className="text-right text-gray-800 dark:text-gray-200">
                  {product.stock}
                </TableCell>
                <TableCell className="text-right text-gray-800 dark:text-gray-200">
                  {product.criticalStock}
                </TableCell>
                <TableCell className="text-right text-gray-800 dark:text-gray-200">
                  {product.price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </TableCell>
                <TableCell>
                  <div 
                    className={`px-3 py-1 rounded-full text-xs font-medium inline-block
                      ${product.stock <= product.criticalStock / 2 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                        : product.stock <= product.criticalStock
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }
                    `}
                  >
                    {product.stock <= product.criticalStock / 2 
                      ? 'Düşük Stok' 
                      : product.stock <= product.criticalStock
                        ? 'Kritik Seviye'
                        : 'Yeterli Stok'
                    }
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export default InventoryPage 