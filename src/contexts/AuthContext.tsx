import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from './axiosInstance'

type UserType = 'admin' | 'customer'

interface User {
  id: string
  email: string
  username: string
  name: string
  type: UserType
  isPremium?: boolean
}

interface AuthContextType {
  user: User | null
  login: (usernameOrEmail: string, password: string, userType: UserType) => Promise<void>
  register: (username: string, email: string, password: string, userType: UserType) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const login = async (usernameOrEmail: string, password: string, userType: UserType) => {
    try {
      const endpoint = userType === 'admin' 
        ? '/api/Admin/LoginAdmin' 
        : '/api/Customer/Login'

      const response = await axiosInstance.post(endpoint, {
        usernameOrEmail,
        password
      })

      localStorage.setItem('AccessToken', response.data.token)
      localStorage.setItem('UserType', userType)
      localStorage.setItem('UserData', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        name: response.data.name,
        type: userType
      }))

      setUser({
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        name: response.data.name,
        type: userType
      })

      if (userType === 'admin') {
        navigate('/admin')
      } else {
        navigate('/customer/home')
      }
    } catch (error) {
      throw new Error('Giriş işlemi başarısız oldu')
    }
  }

  const register = async (username: string, email: string, password: string, userType: UserType) => {
    try {
      const endpoint = userType === 'admin' 
        ? '/api/Admin/SignUpAdmin' 
        : '/api/Customer/SignUp'

      const randomBudget = Math.floor(Math.random() * (3000 - 500 + 1)) + 500

      const registerData = userType === 'admin' 
        ? {
            username,
            mail: email,
            password,
          }
        : {
            username,
            mail: email,
            password,
            budget: randomBudget
          }

      await axiosInstance.post(endpoint, registerData)
      return true // Başarılı kayıt durumunda true döndür
    } catch (error) {
      throw new Error('Kayıt işlemi başarısız oldu')
    }
  }

  const logout = () => {
    localStorage.removeItem('AccessToken')
    localStorage.removeItem('UserType')
    localStorage.removeItem('UserData')
    setUser(null)
    navigate('/auth')
  }

  // Uygulama başladığında kullanıcı bilgilerini kontrol et
  React.useEffect(() => {
    const initializeAuth = async () => {
      const userType = localStorage.getItem('UserType') as UserType | null
      const token = localStorage.getItem('AccessToken')
      const userData = localStorage.getItem('UserData')

      if (token && userType && userData) {
        // Önce localStorage'dan kullanıcı bilgilerini yükle
        setUser(JSON.parse(userData))

        try {
          // API'den güncel bilgileri al
          const response = await axiosInstance.get(
            userType === 'admin' ? '/api/Admin/Profile' : '/api/Customer/Profile'
          )
          
          const updatedUser = {
            ...response.data,
            type: userType
          }
          setUser(updatedUser)
          localStorage.setItem('UserData', JSON.stringify(updatedUser))
        } catch (error) {
          console.error('Profil bilgileri güncellenemedi')
          // API hatası durumunda bile localStorage'daki bilgileri koru
        }
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}