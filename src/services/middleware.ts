import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']
const PROTECTED_PREFIX = ['/dashboard', '/workspace', '/profile']
const CALLBACK_ROUTE = '/auth/callback'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const pathname = request.nextUrl.pathname

  const isPublic = PUBLIC_ROUTES.includes(pathname)
  const isProtected = PROTECTED_PREFIX.some((p) => pathname.startsWith(p))

  if (!token && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (token && isPublic && pathname !== CALLBACK_ROUTE) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  const response = NextResponse.next()

  // Deshabilita bfcache en rutas protegidas
  if (isProtected) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/workspace/:path*',
    '/profile',
    '/login',
    '/register',
    '/auth/callback',
  ],
}