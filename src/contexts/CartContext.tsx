import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import axiosInstance from './axiosInstance'
import { toast } from 'react-toastify'

interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalAmount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { user, isAuthenticated } = useAuth()

  const loadCart = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/Cart/GetCart')
      if (response.data.response.success) {
        setItems(response.data.cart?.items || [])
      } else if (response.data.response.responseType === 'NotFound') {
        // Sepet bulunamadıysa boş array ile başlat
        setItems([])
      } else {
        toast.error(response.data.response.message)
      }
    } catch (error) {
      // Hata durumunda sessizce boş array ile başlat
      console.warn('Sepet yüklenirken bir hata oluştu:', error)
      setItems([])
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.type === 'customer') {
      loadCart()
    }
  }, [isAuthenticated, user, loadCart])

  const saveCart = async (newItems: CartItem[]) => {
    try {
      const response = await axiosInstance.post('/api/Cart/UpdateCart', newItems)
      if (!response.data.response.success && 
          response.data.response.responseType !== 'NotFound') {
        throw new Error(response.data.response.message || 'Sepet kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Sepet kaydetme hatası:', error)
      // Kritik olmayan hatalar için sessiz kal
      if (error instanceof Error && !error.message.includes('NotFound')) {
        toast.error('Sepet kaydedilirken bir hata oluştu')
      }
      await loadCart() // Hata durumunda sepeti yeniden yükle
    }
  }

  const addItem = async (item: CartItem) => {
    try {
        // Ürün stok kontrolü - endpoint düzeltildi
        const response = await axiosInstance.get(`/api/Product/GetProductById?Id=${item.productId}`);
        
        if (!response.data.response.success) {
            toast.error('Ürün bulunamadı');
            return;
        }

        const product = response.data.product;
        const existingItem = items.find(i => i.productId === item.productId);
        const currentQuantity = existingItem?.quantity || 0;
        const newQuantity = currentQuantity + item.quantity;

        if (newQuantity > product.stock) {
            toast.error('Yetersiz stok!');
            return;
        }

        let newItems: CartItem[];

        if (existingItem) {
            newItems = items.map(i =>
                i.productId === item.productId
                    ? { ...item, quantity: Math.min(newQuantity, 5) }
                    : i
            );
        } else {
            newItems = [...items, { ...item, quantity: Math.min(item.quantity, 5) }];
        }

        setItems(newItems);
        await saveCart(newItems);
    } catch (error: unknown) {
        console.error('Ürün bilgisi alınamadı:', error);
        toast.error('Ürün bilgisi alınamadı');
    }
  };

  const removeItem = (productId: string) => {
    const newItems = items.filter(item => item.productId !== productId)
    setItems(newItems)
    saveCart(newItems)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity > 5) {
      toast.warning('Bir üründen en fazla 5 adet ekleyebilirsiniz')
      quantity = 5
    }

    const newItems = items.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    )
    setItems(newItems)
    saveCart(newItems)
  }

  const clearCart = () => {
    setItems([])
    saveCart([])
  }

  const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 