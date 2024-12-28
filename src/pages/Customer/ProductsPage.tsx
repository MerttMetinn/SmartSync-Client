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
  const { addItem } = useCart()
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
    addItem({
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      price: product.price
    })
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
      {/* Başlık ve Özet Bilgiler */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Ürün Kataloğu
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {products.length} ürün listeleniyor
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Mevcut Bakiye: ₺{user?.budget?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Store className="h-16 w-16 text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Henüz Ürün Bulunmuyor
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Şu anda mağazamızda listelenmiş ürün bulunmuyor. Lütfen daha sonra tekrar kontrol edin.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow duration-200">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-primary">
                      ₺{product.price.toFixed(2)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 0 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {product.stock > 0 ? `${product.stock} adet stokta` : 'Stokta yok'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(product.id, String(Math.max(1, quantities[product.id] - 1 || 0)))}
                        disabled={product.stock === 0 || quantities[product.id] <= 1}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={quantities[product.id] || 1}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleQuantityChange(product.id, String(Math.min(5, (quantities[product.id] || 1) + 1)))}
                        disabled={product.stock === 0 || quantities[product.id] >= 5}
                      >
                        +
                      </Button>
                    </div>
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1"
                    >
                      {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </Button>
                  </div>
                  {product.stock > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Maksimum 5 adet satın alabilirsiniz
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 