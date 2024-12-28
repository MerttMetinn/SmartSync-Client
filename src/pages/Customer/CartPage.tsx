import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, ShoppingBag } from 'lucide-react'
import { toast } from 'react-toastify'
import axiosInstance from '@/contexts/axiosInstance'
import { AxiosError } from 'axios'

interface ApiResponse<T> {
  response: {
    success: boolean
    message: string
    data?: T
  }
}

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart()
  const { user } = useAuth()

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value)
    if (isNaN(quantity) || quantity < 1) return
    updateQuantity(productId, quantity)
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.warning('Sepetiniz boş')
      return
    }

    if (!user?.budget || totalAmount > user.budget) {
      toast.error('Yetersiz bakiye')
      return
    }

    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))

      const response = await axiosInstance.post<ApiResponse<void>>('/api/Order/CreateOrder', {
        items: orderItems
      })

      if (response.data.response.success) {
        toast.success('Siparişiniz başarıyla oluşturuldu')
        clearCart()
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || 'Sipariş oluşturulurken bir hata oluştu')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Bakiye */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Sepetim
        </h1>
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Bakiye: ₺{user?.budget?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Sepetiniz Boş
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ürünler sayfasından sepetinize ürün ekleyebilirsiniz.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Sepet Ürünleri */}
          <Card className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <div key={item.productId} className="p-6 flex items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Birim Fiyat: ₺{item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                    className="w-20"
                  />
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      ₺{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.productId)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Toplam */}
            <div className="p-6 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                Toplam Tutar
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₺{totalAmount.toFixed(2)}
              </div>
            </div>
          </Card>

          {/* Sipariş Ver */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={items.length === 0 || !user?.budget || totalAmount > user.budget}
            >
              {!user?.budget || totalAmount > user.budget ? (
                'Yetersiz Bakiye'
              ) : (
                'Sipariş Ver'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage 