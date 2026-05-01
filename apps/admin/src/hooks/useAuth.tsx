import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'))
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) throw new Error('Login failed')

      const data = await response.json()
      setToken(data.access_token)
      setUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem('authToken', data.access_token)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authToken')
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, token }}>
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
