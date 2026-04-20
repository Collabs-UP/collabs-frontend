export { middleware } from './src/services/middleware'

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
