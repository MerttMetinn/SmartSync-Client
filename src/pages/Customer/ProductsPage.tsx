import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ShoppingCart, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Swal from 'sweetalert2'

interface Product {
  id: number
  name: string
  price: number
  stock: number
  description: string
  category: string
}

export function ProductsPage() {
  const { user } = useAuth()
  const [selectedProducts, setSelectedProducts] = useState<{ [key: number]: number }>({})

  const products: Product[] = [
    {
      id: 1,
      name: "Ürün A",
      price: 1500,
      stock: 10,
      description: "Premium kalite ürün",
      category: "Elektronik"
    },
    {
      id: 2,
      name: "Ürün B",
      price: 750,
      stock: 5,
      description: "Orta segment ürün",
      category: "Aksesuar"
    },
    {
      id: 3,
      name: "Ürün C",
      price: 2500,
      stock: 3,
      description: "Üst segment ürün",
      category: "Elektronik"
    }
  ]

  const handleQuantityChange = (productId: number, quantity: string) => {
    const numQuantity = parseInt(quantity)
    if (isNaN(numQuantity) || numQuantity < 0) return

    const product = products.find(p => p.id === productId)
    if (!product) return

    if (numQuantity > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Maksimum Sipariş Limiti',
        text: 'Bir üründen en fazla 5 adet sipariş verebilirsiniz.'
      })
      return
    }

    if (numQuantity > product.stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Yetersiz Stok',
        text: 'Seçtiğiniz miktar stok miktarından fazla olamaz.'
      })
      return
    }

    setSelectedProducts(prev => ({
      ...prev,
      [productId]: numQuantity
    }))
  }

  const getStockStatus = (stock: number) => {
    if (stock > 10) {
      return {
        text: 'Stokta Var',
        color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
      }
    } else if (stock > 0) {
      return {
        text: 'Sınırlı Stok',
        color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
      }
    } else {
      return {
        text: 'Stokta Yok',
        color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
      }
    }
  }

  const calculateTotal = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId))
      return total + (product?.price || 0) * quantity
    }, 0)
  }

  const handleOrder = async () => {
    const total = calculateTotal()
    if (total === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Boş Sipariş',
        text: 'Lütfen en az bir ürün seçiniz.'
      })
      return
    }

    const result = await Swal.fire({
      title: 'Sipariş Onayı',
      html: `
        Toplam Tutar: ${total.toFixed(2)} TL<br>
        ${!user?.isPremium && total >= 2000 ? '<br><strong>Bu alışveriş ile Premium üye olacaksınız!</strong>' : ''}
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sipariş Ver',
      cancelButtonText: 'İptal'
    })

    if (result.isConfirmed) {
      // Burada sipariş işlemi gerçekleştirilecek
      Swal.fire({
        icon: 'success',
        title: 'Sipariş Alındı',
        text: 'Siparişiniz başarıyla oluşturuldu.'
      })
      setSelectedProducts({})
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürünler</h1>
        <Button onClick={handleOrder} disabled={Object.keys(selectedProducts).length === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Sipariş Ver
        </Button>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200 dark:border-gray-700">
              <TableHead className="text-gray-700 dark:text-gray-300">Ürün Adı</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Fiyat</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Stok</TableHead>
              <TableHead className="text-gray-700 dark:text-gray-300">Miktar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-gray-200 dark:border-gray-700">
                <TableCell>
                  <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{product.description}</div>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">₺{product.price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatus(product.stock).color}`}>
                    {getStockStatus(product.stock).text}
                  </span>
                </TableCell>
                <TableCell className="text-gray-900 dark:text-white">
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    value={selectedProducts[product.id] || ''}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 