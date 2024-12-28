import React, { createContext, useContext, useEffect, useState } from 'react'
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

  useEffect(() => {
    if (isAuthenticated && user?.type === 'customer') {
      loadCart()
    }
  }, [isAuthenticated, user])

  const loadCart = async () => {
    try {
      const response = await axiosInstance.get('/api/Cart')
      if (response.data.response.success) {
        setItems(response.data.cart.items)
      }
    } catch {
      toast.error('Sepet yüklenirken bir hata oluştu')
    }
  }

  const saveCart = async (newItems: CartItem[]) => {
    try {
      await axiosInstance.post('/api/Cart', newItems)
    } catch {
      toast.error('Sepet kaydedilirken bir hata oluştu')
    }
  }

  const addItem = (item: CartItem) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(i => i.productId === item.productId)
      let newItems: CartItem[]

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + item.quantity, 5)
        newItems = currentItems.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: newQuantity }
            : i
        )
      } else {
        newItems = [...currentItems, { ...item, quantity: Math.min(item.quantity, 5) }]
      }

      saveCart(newItems)
      return newItems
    })
  }

  const removeItem = (productId: string) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.productId !== productId)
      saveCart(newItems)
      return newItems
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity > 5) {
      toast.warning('Bir üründen en fazla 5 adet ekleyebilirsiniz')
      quantity = 5
    }

    setItems(currentItems => {
      const newItems = currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
      saveCart(newItems)
      return newItems
    })
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