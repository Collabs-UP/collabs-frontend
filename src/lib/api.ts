import axios from 'axios'
import Cookies from 'js-cookie'
import { BACKEND_ORIGIN } from '@/lib/envs'

const apiBaseUrl = BACKEND_ORIGIN
  ? (BACKEND_ORIGIN.endsWith('/api') ? BACKEND_ORIGIN : `${BACKEND_ORIGIN}/api`)
  : undefined

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// maneja errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token', { path: '/' })
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api