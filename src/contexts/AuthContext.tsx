import React, { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type UserType = 'company' | 'customer'

interface User {
  id: string
  email: string
  name: string
  type: UserType
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, userType: UserType) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users
const MOCK_USERS = [
  {
    id: '1',
    email: 'sirket@ornek.com',
    password: '123456',
    name: 'Örnek Şirket',
    type: 'company' as UserType
  },
  {
    id: '2',
    email: 'kullanici@ornek.com',
    password: '123456',
    name: 'Örnek Kullanıcı',
    type: 'customer' as UserType
  }
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()

  const login = async (email: string, password: string, userType: UserType) => {
    // Mock login işlemi
    const mockUser = MOCK_USERS.find(
      u => u.email === email && u.password === password && u.type === userType
    )

    if (mockUser) {
      const { password: _, ...userWithoutPassword } = mockUser
      setUser(userWithoutPassword)
      
      // Kullanıcı tipine göre yönlendirme
      if (userType === 'company') {
        navigate('/admin')
      } else {
        navigate('/customer')
      }
    } else {
      throw new Error('Geçersiz kullanıcı bilgileri')
    }
  }

  const logout = () => {
    setUser(null)
    navigate('/auth')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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