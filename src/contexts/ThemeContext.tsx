import React, { createContext, useContext, useEffect, useState } from 'react'

type ThemeType = 'light' | 'dark'

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
  border: string
}

interface ThemeContextType {
  theme: ThemeType
  toggleTheme: () => void
  colors: ThemeColors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme')
      return (savedTheme as ThemeType) || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
    return 'light'
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  const colors: ThemeColors = {
    primary: theme === 'dark' ? '#60a5fa' : '#3b82f6',
    secondary: theme === 'dark' ? '#4b5563' : '#6b7280',
    background: theme === 'dark' ? '#111827' : '#ffffff',
    text: theme === 'dark' ? '#f3f4f6' : '#111827',
    border: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 1)'
  }

  const value = {
    theme,
    toggleTheme,
    colors
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 