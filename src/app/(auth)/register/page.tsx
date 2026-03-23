'use client'

import '../auth.css'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

function getStrength(password: string): {
  level: 'weak' | 'medium' | 'strong' | null
  bars: number
  label: string
} {
  if (!password) return { level: null, bars: 0, label: '' }
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const long = password.length >= 10

  const score = [hasUpper, hasNumber, hasSpecial, long].filter(Boolean).length

  if (score <= 1) return { level: 'weak',   bars: 1, label: 'Débil' }
  if (score <= 3) return { level: 'medium',  bars: 2, label: 'Media' }
  return              { level: 'strong',  bars: 4, label: 'Fuerte' }
}

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = useMemo(() => getStrength(form.password), [form.password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })
      router.push('/dashboard')
    } catch {
      setError('Error al crear la cuenta. Intenta con otro correo.')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ show }: { show: boolean }) =>
    show ? (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 3l14 14M8.5 8.6A3 3 0 0011.4 11.5M6.4 6.4A7 7 0 003 10s2.5 5 7 5a6.8 6.8 0 003.6-1M9 5.1A7 7 0 0117 10s-.7 1.5-2 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ) : (
      <svg viewBox="0 0 20 20" fill="none">
        <ellipse cx="10" cy="10" rx="7" ry="5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    )

  return (
    <div className="auth-layout">

      {/* Panel izquierdo */}
      <div className="brand-panel register">
        <div className="brand-grid-overlay" />
        <div className="brand-glow" />

        <div className="brand-logo">
          <div className="logo-mark">
            <span className="logo-dot" />
            <span className="logo-dot accent" />
            <span className="logo-dot small" />
          </div>
          <span className="logo-text white">collabs</span>
        </div>

        <div className="brand-content">
          <h1 className="brand-headline white">
            Empieza<br />hoy mismo.
          </h1>
          <p className="brand-sub white">
            Crea tu cuenta y organiza tu primer proyecto
            colaborativo en menos de 2 minutos.
          </p>
          <div className="brand-steps">
            {[
              { n: '1', title: 'Crea tu cuenta',    desc: 'Nombre, correo y contraseña' },
              { n: '2', title: 'Crea un espacio',   desc: 'Ponle nombre y descripción' },
              { n: '3', title: 'Invita a tu equipo', desc: 'Comparte el código de acceso' },
            ].map((s, i) => (
              <div key={s.n}>
                <div className="step-item">
                  <div className="step-num">{s.n}</div>
                  <div>
                    <p className="step-title">{s.title}</p>
                    <p className="step-desc">{s.desc}</p>
                  </div>
                </div>
                {i < 2 && <div className="step-connector" />}
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
            <h2 className="form-title">Crear cuenta</h2>
            <p className="form-subtitle">
              Completa los campos para registrarte en Collabs
            </p>
          </div>

          <div className="tab-toggle">
            <Link href="/login" className="tab-btn">Iniciar sesión</Link>
            <button className="tab-btn active">Registrarse</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>

            <div className="field-group">
              <label className="field-label">Nombre completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="José Pérez"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

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

            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Contraseña</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Confirmar contraseña</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Repite tu contraseña"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            {/* Indicador de fortaleza */}
            {form.password && (
              <div className="strength-row">
                <span className="strength-label">Seguridad</span>
                <div className="strength-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`strength-bar ${
                        strength.bars >= n ? strength.level ?? '' : ''
                      }`}
                    />
                  ))}
                </div>
                <span className={`strength-text ${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta →'}
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
            ¿Ya tienes cuenta?{' '}
            <Link href="/login">Inicia sesión</Link>
          </p>

        </div>
      </div>

    </div>
  )
}