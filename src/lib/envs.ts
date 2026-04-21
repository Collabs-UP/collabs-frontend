const rawBackendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? ''

export const BACKEND_ORIGIN = rawBackendOrigin.trim().replace(/\/$/, '')
