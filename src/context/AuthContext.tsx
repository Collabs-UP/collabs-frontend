'use client'
 
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { AuthService } from '@/services/auth.service'
import type { User, LoginDto, RegisterDto } from '@/types'
import Cookies from 'js-cookie'
 
interface AuthContextType {
  user: User | null
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
    // Verifica si hay sesión activa al cargar la app
    const token = Cookies.get('access_token')
    if (!token) {
      setIsLoading(false)
    }
    // GET /auth/me para obtener el usuario actual
    setIsLoading(false)
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