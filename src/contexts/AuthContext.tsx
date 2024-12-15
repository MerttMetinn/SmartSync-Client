import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from './axiosInstance'

type UserType = 'company' | 'customer'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const login = async (usernameOrEmail: string, password: string, userType: UserType) => {
    try {
      // Kullanıcı tipine göre endpoint seçimi
      const endpoint = userType === 'company' 
        ? '/api/Company/Login' 
        : '/api/Customer/Login'

      const response = await axiosInstance.post(endpoint, {
        usernameOrEmail,
        password
      })

      localStorage.setItem('AccessToken', response.data.token)
      localStorage.setItem('UserType', userType) // Kullanıcı tipini de saklayalım

      setUser({
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        name: response.data.name,
        type: userType
      })

      // Kullanıcı tipine göre yönlendirme
      if (userType === 'company') {
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
      const endpoint = userType === 'company' 
        ? '/api/Company/SignUp' 
        : '/api/Customer/SignUp'

      const randomBudget = Math.floor(Math.random() * (3000 - 500 + 1)) + 500

      const registerData = userType === 'company' 
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
    setUser(null)
    navigate('/auth')
  }

  // Uygulama başladığında kullanıcı tipini kontrol et
  React.useEffect(() => {
    const userType = localStorage.getItem('UserType') as UserType | null
    const token = localStorage.getItem('AccessToken')

    if (token && userType) {
      // Token ve kullanıcı tipi varsa, kullanıcı bilgilerini getir
      axiosInstance.get(userType === 'company' ? '/api/Company/Profile' : '/api/Customer/Profile')
        .then(response => {
          setUser({
            ...response.data,
            type: userType
          })
        })
        .catch(() => {
          logout() // Hata durumunda logout yap
        })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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