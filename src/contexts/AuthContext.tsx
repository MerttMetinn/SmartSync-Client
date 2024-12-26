import React, { createContext, useContext, useState, useEffect } from 'react'
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
  budget?: number
  totalSpent?: number
  createdDate?: string
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
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('AccessToken')
      const storedUser = localStorage.getItem('UserData')

      if (token && storedUser) {
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
      setIsLoading(false)
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

      const userData = {
        ...response.data,
        type: userType
      }

      localStorage.setItem('AccessToken', response.data.token)
      localStorage.setItem('UserData', JSON.stringify(userData))
      setUser(userData)
      setIsAuthenticated(true)

      if (userType === 'admin') {
        navigate('/admin')
      } else {
        navigate('/customer/home')
      }

      return userData
    } catch (error) {
      throw new Error('Giriş işlemi başarısız oldu')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      const endpoint = user?.type === 'admin' 
        ? '/api/Admin/UpdateProfile' 
        : '/api/Customer/UpdateProfile'

      const response = await axiosInstance.put(endpoint, userData)
      const updatedUser = { ...user, ...response.data }
      setUser(updatedUser)
      localStorage.setItem('UserData', JSON.stringify(updatedUser))
    } catch (error) {
      throw new Error('Profil güncellenirken bir hata oluştu')
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
            budget: randomBudget
          }

      await axiosInstance.post(endpoint, registerData)
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

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateUser
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