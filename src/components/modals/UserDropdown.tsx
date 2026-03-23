'use client'

import { useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import './modals.css'

interface Props {
  onClose: () => void
}

export default function UserDropdown({ onClose }: Props) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  // Cierra al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const handleProfile = () => {
    router.push('/profile')
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <div className="user-dropdown" ref={ref}>

      {/* Header */}
      <div className="user-dropdown-header">
        <div className="user-dropdown-avatar">{initials}</div>
        <div className="user-dropdown-info">
          <p className="user-dropdown-name">{user?.name ?? 'Usuario'}</p>
          <p className="user-dropdown-email">{user?.email ?? ''}</p>
        </div>
        <svg viewBox="0 0 16 16" fill="none" className="user-dropdown-chevron">
          <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="user-dropdown-divider" />

      {/* Mi Perfil */}
      <button className="user-dropdown-item" onClick={handleProfile}>
        <svg viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>Mi Perfil</span>
      </button>

      <div className="user-dropdown-divider" />

      {/* Cerrar sesión */}
      <button className="user-dropdown-item danger" onClick={handleLogout}>
        <svg viewBox="0 0 20 20" fill="none">
          <path d="M13 15l4-5-4-5M17 10H8M8 3H5a2 2 0 00-2 2v10a2 2 0 002 2h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>Cerrar sesión</span>
      </button>

    </div>
  )
}