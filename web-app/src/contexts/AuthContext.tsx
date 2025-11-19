import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, UserLogin, UserCreate, Token } from '../types'
import * as api from '../services/api'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: UserLogin) => Promise<void>
  register: (userData: UserCreate) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')

    if (storedToken) {
      setToken(storedToken)
      fetchCurrentUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const userData = await api.getCurrentUser(authToken)
      setUser(userData)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: UserLogin) => {
    const tokenData: Token = await api.login(credentials)

    localStorage.setItem('token', tokenData.access_token)
    setToken(tokenData.access_token)

    await fetchCurrentUser(tokenData.access_token)
  }

  const register = async (userData: UserCreate) => {
    await api.register(userData)

    await login({
      email: userData.email,
      password: userData.password
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
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
