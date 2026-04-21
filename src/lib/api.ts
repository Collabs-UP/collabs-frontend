import axios from 'axios'
import Cookies from 'js-cookie'
import { BACKEND_ORIGIN } from '@/lib/envs'

function withApiPrefix(url?: string) {
  if (!url) return '/api'
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/api/')) return url
  if (url === '/api') return url
  if (url.startsWith('/')) return `/api${url}`
  return `/api/${url}`
}

const api = axios.create({
  baseURL: BACKEND_ORIGIN ? `${BACKEND_ORIGIN}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de request
api.interceptors.request.use((config) => {
  config.url = withApiPrefix(config.url)

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