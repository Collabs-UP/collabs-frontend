'use client'

import '../auth.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form)
      router.push('/dashboard')
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">

      {/* Panel izquierdo */}
      <div className="brand-panel">
        <div className="brand-grid-overlay" />
        <div className="brand-glow" />

        <div className="brand-logo">
          <div className="logo-mark">
            <span className="logo-dot" />
            <span className="logo-dot accent" />
            <span className="logo-dot small" />
          </div>
          <span className="logo-text">collabs</span>
        </div>

        <div className="brand-content">
          <h1 className="brand-headline">
            Tu equipo.<br />Un solo lugar.
          </h1>
          <p className="brand-sub">
            Gestiona proyectos colaborativos, asigna tareas y sigue
            el progreso de tu equipo en tiempo real.
          </p>
          <div className="brand-features">
            {[
              'Espacios de trabajo privados',
              'Asignación de tareas por responsable',
              'Dashboard de progreso en tiempo real',
            ].map((f) => (
              <div key={f} className="feature-item">
                <span className="feature-icon">◈</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div />
      </div>

      {/* Panel derecho */}
      <div className="form-panel">
        <div className="form-container">

          <div className="form-header">
            <h2 className="form-title">Iniciar sesión</h2>
            <p className="form-subtitle">Ingresa tus credenciales para continuar</p>
          </div>

          <div className="tab-toggle">
            <button className="tab-btn active">Iniciar sesión</button>
            <Link href="/register" className="tab-btn">Registrarse</Link>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>

            <div className="field-group">
              <label className="field-label">Correo electrónico</label>
              <input
                type="email"
                className="form-input"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Contraseña</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none">
                      <path d="M3 3l14 14M8.5 8.6A3 3 0 0011.4 11.5M6.4 6.4A7 7 0 003 10s2.5 5 7 5a6.8 6.8 0 003.6-1M9 5.1A7 7 0 0117 10s-.7 1.5-2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none">
                      <ellipse cx="10" cy="10" rx="7" ry="5" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>

          </form>

          <div className="form-divider">
            <span /><p>o continúa con</p><span />
          </div>

          <button className="btn-google" type="button">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

          <p className="form-footer">
            ¿No tienes cuenta?{' '}
            <Link href="/register">Regístrate gratis</Link>
          </p>

        </div>
      </div>

    </div>
  )
}