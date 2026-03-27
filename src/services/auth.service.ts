import api from '@/lib/api'
import Cookies from 'js-cookie'
import type { LoginDto, RegisterDto, AuthResponse } from '@/types'

export const AuthService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/auth/login', data)
    Cookies.set('access_token', res.data.access_token, {
      expires: 7,
      path: '/',
      sameSite: 'lax',
    })
    return res.data
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    await api.post('/auth/register', data)
    const loginRes = await api.post<AuthResponse>('/auth/login', {
      email: data.email,
      password: data.password,
    })
    Cookies.set('access_token', loginRes.data.access_token, {
      expires: 7,
      path: '/',
      sameSite: 'lax',
    })
    return loginRes.data
  },

  logout: () => {
    Cookies.remove('access_token', { path: '/' })
    window.location.replace('/login')
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get('access_token')
  },
}