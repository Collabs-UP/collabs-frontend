'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { useAuth } from '@/context/AuthContext'
import { UserService } from '@/services/user.service'

function getTokenFromUrl() {
  if (typeof window === 'undefined') return ''

  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  return (
    query.get('token') ??
    query.get('access_token') ??
    query.get('authToken') ??
    hash.get('token') ??
    hash.get('access_token') ??
    hash.get('authToken') ??
    ''
  )
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [status, setStatus] = useState('Procesando inicio de sesión...')
  const [error, setError] = useState('')

  const tokenFromUrl = useMemo(() => getTokenFromUrl(), [])

  useEffect(() => {
    const handleCallback = async () => {
      const token = tokenFromUrl || Cookies.get('access_token') || ''

      if (!token) {
        setError('No se recibió un token válido desde el backend.')
        setStatus('No pudimos completar la autenticación.')
        return
      }

      Cookies.set('access_token', token, {
        expires: 7,
        path: '/',
        sameSite: 'lax',
      })

      try {
        const response = await UserService.getMe()
        const userData = response.user || response
        setUser(userData)
        setStatus('Sesión iniciada correctamente. Redirigiendo...')
        router.replace('/dashboard')
      } catch {
        Cookies.remove('access_token', { path: '/' })
        setUser(null)
        setError('El token recibido no es válido o expiró.')
        setStatus('La sesión no pudo completarse.')
      }
    }

    handleCallback()
  }, [router, setUser, tokenFromUrl])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: 'linear-gradient(180deg, #F8F8FE 0%, #EEF0FF 100%)',
      }}
    >
      <section
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '24px',
          padding: '32px',
          background: '#FFFFFF',
          boxShadow: '0 24px 80px rgba(17, 17, 40, 0.12)',
          border: '1px solid #E6E5F3',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 20px',
            background: '#EEEEFD',
            color: '#6355E8',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
            <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#111128' }}>
          Finalizando autenticación
        </h1>
        <p style={{ color: '#55557A', lineHeight: 1.6, marginBottom: '20px' }}>
          Estamos validando tu sesión y preparando tu acceso al dashboard.
        </p>

        {error ? (
          <>
            <p
              className="error-msg"
              style={{ marginBottom: '16px', textAlign: 'left' }}
            >
              {error}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => router.replace('/login')}
            >
              Volver al login
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                width: '100%',
                height: '8px',
                borderRadius: '999px',
                background: '#EDEDF5',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '60%',
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #6355E8, #0D9488)',
                  animation: 'callback-loading 1.2s ease-in-out infinite',
                }}
              />
            </div>
            <p style={{ color: '#6355E8', fontWeight: 600 }}>{status}</p>
          </>
        )}

        <style jsx>{`
          @keyframes callback-loading {
            0% {
              transform: translateX(-40%);
              opacity: 0.5;
            }
            50% {
              transform: translateX(40%);
              opacity: 1;
            }
            100% {
              transform: translateX(-40%);
              opacity: 0.5;
            }
          }
        `}</style>
      </section>
    </main>
  )
}

