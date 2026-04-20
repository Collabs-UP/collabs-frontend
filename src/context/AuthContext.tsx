'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import Cookies from 'js-cookie'
import { AuthService } from '@/services/auth.service'
import type { User, LoginDto, RegisterDto } from '@/types'
import { UserService } from '@/services/user.service'

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void // Esta es la que faltaba abajo
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('access_token')

      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await UserService.getMe()
        const userData = response.user || response
        setUser(userData)
      } catch {
        Cookies.remove('access_token', { path: '/' })
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (data: LoginDto) => {
    const res = await AuthService.login(data)
    setUser(res.user)
  }

  const register = async (data: RegisterDto) => {
    const res = await AuthService.register(data)
    setUser(res.user)
  }

  const logout = () => {
    setUser(null)
    AuthService.logout()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // 👈 ¡ESTA LÍNEA FALTABA! Por eso marcaba error rojo
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}