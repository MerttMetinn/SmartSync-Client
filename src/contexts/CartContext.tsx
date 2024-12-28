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
        setItems(response.data.cart.items || [])
      }
    } catch {
      toast.error('Sepet yüklenirken bir hata oluştu')
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
      if (!response.data.response.success) {
        throw new Error(response.data.response.message || 'Sepet kaydedilirken bir hata oluştu')
      }
    } catch (error) {
      console.error('Sepet kaydetme hatası:', error)
      toast.error('Sepet kaydedilirken bir hata oluştu')
      await loadCart() // Hata durumunda sepeti yeniden yükle
    }
  }

  const addItem = (item: CartItem) => {
    const existingItem = items.find(i => i.productId === item.productId)
    let newItems: CartItem[]

    if (existingItem) {
      newItems = items.map(i =>
        i.productId === item.productId
          ? { ...item, quantity: Math.min(existingItem.quantity + item.quantity, 5) }
          : i
      )
    } else {
      newItems = [...items, { ...item, quantity: Math.min(item.quantity, 5) }]
    }

    setItems(newItems)
    saveCart(newItems)
  }

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