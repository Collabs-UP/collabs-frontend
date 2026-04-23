const rawBackendOrigin = process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? ''

function normalizePublicBackendOrigin(value: string): string {
  return value
    .trim()
    .replace(/^['\"]|['\"]$/g, '')
    .replace(/\/+$/, '')
    .replace(/\/api$/i, '')
}

export const BACKEND_ORIGIN = normalizePublicBackendOrigin(rawBackendOrigin)
