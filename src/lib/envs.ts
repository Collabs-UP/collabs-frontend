const rawBackendOrigin =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ??
  process.env.NEXT_PUBLIC_API_URL ??
  ''

export const BACKEND_ORIGIN = rawBackendOrigin.trim().replace(/\/$/, '')
