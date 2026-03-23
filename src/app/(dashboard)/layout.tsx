'use client'

import './dashboard.css'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import NewWorkspaceModal from '@/components/modals/NewWorkspaceModal'
import UserDropdown from '@/components/modals/UserDropdown'
import JoinWorkspacePopup from '@/components/modals/JoinWorkspacePopup'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const { activeWorkspace, showNewWorkspace, setShowNewWorkspace } = useWorkspace()
  const pathname = usePathname()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showJoinPopup, setShowJoinPopup] = useState(false)

  // TODO: descomentar cuando el backend esté listo
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/login')
  //   }
  // }, [isLoading, isAuthenticated, router])
  // if (isLoading) return null

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="app-layout">
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <span className="logo-dot" />
            <span className="logo-dot accent" />
            <span className="logo-dot small" />
          </div>
          <span className="logo-text">collabs</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Principal</p>
          <Link
            href="/dashboard"
            className={`nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="2" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="11" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Dashboard</span>
          </Link>

          {/* Espacio activo */}
          {activeWorkspace && (
            <>
              <p className="nav-section-label">{activeWorkspace.project_name}</p>
              <Link
                href={`/workspace/${activeWorkspace.id}/tasks`}
                className={`nav-item ${pathname.includes('/tasks') ? 'active' : ''}`}
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M5 10l3.5 3.5L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>Tareas</span>
              </Link>
              <Link
                href={`/workspace/${activeWorkspace.id}/members`}
                className={`nav-item ${pathname.includes('/members') ? 'active' : ''}`}
              >
                <svg viewBox="0 0 20 20" fill="none">
                  <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 17c0-3.3 2.7-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="14" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 17c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>Miembros</span>
              </Link>
            </>
          )}

          <p className="nav-section-label">Equipo</p>
          <button
            className={`nav-item ${showJoinPopup ? 'active' : ''}`}
            onClick={() => {
              setShowJoinPopup(!showJoinPopup)
              setShowUserDropdown(false)
            }}
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <span>Unirse a espacio</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div
            className="user-chip"
            onClick={() => {
              setShowUserDropdown(!showUserDropdown)
              setShowJoinPopup(false)
            }}
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <p className="user-name">{user?.name ?? 'Usuario'}</p>
              <p className="user-email">{user?.email ?? ''}</p>
            </div>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              style={{ width: 14, height: 14, color: 'var(--text-3)', flexShrink: 0 }}
            >
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Dropdown usuario */}
        {showUserDropdown && (
          <UserDropdown onClose={() => setShowUserDropdown(false)} />
        )}

        {/* Popup unirse a espacio */}
        {showJoinPopup && (
          <JoinWorkspacePopup onClose={() => setShowJoinPopup(false)} />
        )}

      </aside>

      <main className="main-content">
        {children}
      </main>

      {/* Modal nuevo workspace */}
      {showNewWorkspace && (
        <NewWorkspaceModal onClose={() => setShowNewWorkspace(false)} />
      )}

    </div>
  )
}