import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'react-toastify'
import axiosInstance from '@/contexts/axiosInstance'
import { AxiosError } from 'axios'
import { Loader2 } from 'lucide-react'
import { Store } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  createdDate: string
  orderProducts: null
}

interface ApiResponse {
  products: Product[]
  response: {
    message: string
    responseType: number
    success: boolean
  }
}

export function ProductsPage() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  // Ürünleri getir
  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get<ApiResponse>('/api/Product/GetProducts')
      console.log('API Yanıtı:', response.data)
      
      if (response.data.response.success && response.data.products) {
        const products = response.data.products
        console.log('Ürünler:', products)
        setProducts(products)
        
        // Her ürün için varsayılan miktar 1 olarak ayarla
        const defaultQuantities = products.reduce((acc, product) => ({
          ...acc,
          [product.id]: 1
        }), {})
        setQuantities(defaultQuantities)
      } else {
        console.log('API başarılı ancak veri yok:', response.data)
        toast.warning('Henüz ürün bulunmuyor.')
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('API Hatası:', error.response?.data)
        toast.error(error.response?.data?.message || 'Ürünler yüklenirken bir hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value)
    if (isNaN(quantity) || quantity < 1) return

    const product = products.find(p => p.id === productId)
    if (!product) return

    if (quantity > 5) {
      toast.warning('Bir üründen en fazla 5 adet satın alabilirsiniz.')
      return
    }

    if (quantity > product.stock) {
      toast.warning('Seçtiğiniz miktar stok miktarından fazla olamaz.')
      return
    }

    setQuantities(prev => ({
      ...prev,
      [productId]: quantity
    }))
  }

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1
    addToCart(product, quantity)
    toast.success('Ürün sepete eklendi')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Bakiye */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Ürünler
        </h1>
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Bakiye: ₺{user?.budget?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Store className="h-12 w-12 text-gray-400" />
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Henüz Ürün Bulunmuyor
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Yakında yeni ürünler eklenecektir.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₺{product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stok: {product.stock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-20"
                  />
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1"
                  >
                    Sepete Ekle
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 