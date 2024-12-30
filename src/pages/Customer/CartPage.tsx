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
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart()
  const { user } = useAuth()

  const handleQuantityChange = async (productId: string, value: string) => {
    const quantity = parseInt(value)
    if (isNaN(quantity) || quantity < 1) return

    try {
        const response = await axiosInstance.get(`/api/Product/GetProductById?Id=${productId}`);
        
        if (!response.data.response.success) {
            toast.error('Ürün bulunamadı');
            return;
        }

        const product = response.data.product;

        if (quantity > product.stock) {
            toast.error('Yetersiz stok!');
            return;
        }

        if (quantity > 5) {
            toast.warning('Bir üründen en fazla 5 adet ekleyebilirsiniz');
            return;
        }

        updateQuantity(productId, quantity);
    } catch (error: unknown) {
        console.error('Ürün bilgisi alınamadı:', error);
        toast.error('Ürün bilgisi alınamadı');
    }
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
      const orderRequest = {
        price: totalAmount,
        products: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }

      const response = await axiosInstance.post<ApiResponse<void>>('/api/Order/CreateOrder', orderRequest)

      if (response.data.response.success) {
        await clearCart()
        
        const profileResponse = await axiosInstance.get('/api/Customer/GetProfile')
        if (profileResponse.data.response.success) {
          const customerData = {
            ...user,
            budget: profileResponse.data.customer.budget || 0,
            totalSpent: profileResponse.data.customer.totalSpent || 0,
            customerType: profileResponse.data.customer.type === 0 ? 'Normal' : 'Premium'
          }
          localStorage.setItem('UserData', JSON.stringify(customerData))
          window.dispatchEvent(new Event('userDataUpdated'))
        }

        toast.success('Siparişiniz başarıyla oluşturuldu')
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
      {/* Başlık ve Özet Bilgiler */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Alışveriş Sepetim
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {items.length} ürün
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Mevcut Bakiye: ₺{user?.budget?.toFixed(2) || '0.00'}
            </span>
          </div>
          {user?.budget && totalAmount > user.budget && (
            <div className="bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                Yetersiz Bakiye: ₺{(totalAmount - user.budget).toFixed(2)} eksik
              </span>
            </div>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
            <div className="space-y-2">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Sepetiniz Boş
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Henüz sepetinize ürün eklemediniz. Ürünler sayfasından beğendiğiniz ürünleri sepetinize ekleyebilirsiniz.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/customer/products'}
                className="mt-4"
              >
                Ürünlere Göz At
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Sepet Ürünleri */}
          <Card className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <div key={item.productId} className="p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {item.productName}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Birim Fiyat: ₺{item.price.toFixed(2)}</span>
                    <span>•</span>
                    <span>Toplam: ₺{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.productId, String(Math.max(1, item.quantity - 1)))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                      className="w-16 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(item.productId, String(Math.min(5, item.quantity + 1)))}
                      disabled={item.quantity >= 5}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.productId)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Toplam ve Özet */}
            <div className="p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Ara Toplam</span>
                <span className="font-medium">₺{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Toplam</span>
                <span className="text-2xl font-bold text-primary">₺{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Sipariş Ver */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={clearCart}
              className="w-full md:w-auto"
            >
              Sepeti Temizle
            </Button>
            <Button
              size="lg"
              onClick={handleCheckout}
              disabled={items.length === 0 || !user?.budget || totalAmount > user.budget}
              className="w-full md:w-auto"
            >
              {!user?.budget || totalAmount > user.budget ? (
                'Yetersiz Bakiye'
              ) : (
                'Siparişi Tamamla'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage 