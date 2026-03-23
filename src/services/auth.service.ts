import api from '@/lib/api'
import Cookies from 'js-cookie'
import type { LoginDto, RegisterDto, AuthResponse } from '@/types'

export const AuthService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data)
    Cookies.set('access_token', res.data.access_token, { expires: 7 })
    return res.data
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/register', data)
    Cookies.set('access_token', res.data.access_token, { expires: 7 })
    return res.data
  },

  logout: () => {
    Cookies.remove('access_token')
    window.location.href = '/login'
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get('access_token')
  },
}