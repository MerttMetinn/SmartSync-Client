import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from './axiosInstance'
import { toast } from 'react-toastify'

type UserType = 'admin' | 'customer'
type CustomerType = 'Normal' | 'Premium'

interface User {
  id: string
  username: string
  mail: string
  type: UserType
  budget: number
  totalSpent: number
  customerType: CustomerType
  createdDate: string
  token?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (usernameOrEmail: string, password: string, userType: UserType) => Promise<User>
  register: (userData: {
    username: string
    email: string
    password: string
    userType: UserType
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const updateUserData = async () => {
    const storedUser = localStorage.getItem('UserData')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      } catch (error) {
        console.error('Kullanıcı verisi güncellenirken hata oluştu:', error)
      }
    }
  }

  useEffect(() => {
    window.addEventListener('userDataUpdated', updateUserData)
    return () => {
      window.removeEventListener('userDataUpdated', updateUserData)
    }
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('AccessToken')
        const storedUser = localStorage.getItem('UserData')

        if (token && storedUser) {
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          try {
            const storedUserData = JSON.parse(storedUser)
            
            if (storedUserData.type === 'customer') {
              const response = await axiosInstance.get('/api/Customer/GetProfile')
              if (response.data.response.success) {
                const userData = {
                  ...storedUserData,
                  budget: response.data.customer.budget || 0,
                  totalSpent: response.data.customer.totalSpent || 0,
                  customerType: response.data.customer.type === 0 ? 'Normal' : 'Premium'
                }
                setUser(userData)
                setIsAuthenticated(true)
              } else {
                localStorage.removeItem('AccessToken')
                localStorage.removeItem('UserData')
              }
            } else if (storedUserData.type === 'admin') {
              setUser(storedUserData)
              setIsAuthenticated(true)
            }
          } catch {
            localStorage.removeItem('AccessToken')
            localStorage.removeItem('UserData')
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (usernameOrEmail: string, password: string, userType: UserType): Promise<User> => {
    try {
      setIsLoading(true)
      const endpoint = userType === 'admin' ? '/api/Admin/LoginAdmin' : '/api/Customer/Login'
      
      const response = await axiosInstance.post(endpoint, {
        usernameOrEmail,
        password
      })

      if (!response.data.response.success) {
        throw new Error(response.data.response.message || 'Giriş işlemi başarısız oldu')
      }

      const token = response.data.token
      const userData = {
        ...response.data.user,
        type: userType
      }

      localStorage.setItem('AccessToken', token)
      localStorage.setItem('UserData', JSON.stringify(userData))
      
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(userData)
      setIsAuthenticated(true)

      if (userType === 'customer') {
        try {
          const customerResponse = await axiosInstance.get('/api/Customer/GetProfile')
          if (customerResponse.data.response.success) {
            const customerData = {
              ...userData,
              budget: customerResponse.data.customer.budget || 0,
              totalSpent: customerResponse.data.customer.totalSpent || 0,
              customerType: customerResponse.data.customer.type === 0 ? 'Normal' : 'Premium'
            }
            setUser(customerData)
            localStorage.setItem('UserData', JSON.stringify(customerData))
          }
        } catch {
          setUser(userData)
          localStorage.setItem('UserData', JSON.stringify(userData))
        }
      }

      if (userType === 'admin') {
        navigate('/admin')
      } else {
        navigate('/customer/home')
      }

      return userData
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Giriş işlemi başarısız oldu'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: { username: string; email: string; password: string; userType: UserType }) => {
    try {
      const endpoint = userData.userType === 'admin' 
        ? '/api/Admin/SignUpAdmin' 
        : '/api/Customer/SignUp'

      const randomBudget = Math.floor(Math.random() * (3000 - 500 + 1)) + 500

      const registerData = userData.userType === 'admin' 
        ? {
            username: userData.username,
            mail: userData.email,
            password: userData.password,
          }
        : {
            username: userData.username,
            mail: userData.email,
            password: userData.password,
            budget: randomBudget,
            type: 'Normal' as CustomerType,
            totalSpent: 0
          }

      const response = await axiosInstance.post(endpoint, registerData)
      
      if (!response.data.response.success) {
        throw new Error(response.data.response.message || 'Kayıt işlemi başarısız oldu')
      }

      return response.data
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Kayıt işlemi başarısız oldu'
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const logout = () => {
    localStorage.removeItem('AccessToken')
    localStorage.removeItem('UserData')
    delete axiosInstance.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
    navigate('/auth')
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout
    }}>
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