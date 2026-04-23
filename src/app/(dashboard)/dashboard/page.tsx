'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/context/WorkspaceContext'
import { WorkspaceService } from '@/services/workspace.service'
import type { Workspace } from '@/types'
import axios from 'axios'; // Asegúrate de importar axios

export default function DashboardPage() {
  const router = useRouter()
  const {
    setActiveWorkspace,
    setWorkspaces,
    workspaces,
    setShowNewWorkspace,
  } = useWorkspace()
  const [loading, setLoading] = useState(true)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [filter, setFilter] = useState<'all' | 'owner' | 'member'>('all')

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  useEffect(() => {
    WorkspaceService.getAll()
      .then((data) => setWorkspaces(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [setWorkspaces])

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setJoining(true)
    try {
      const ws = await WorkspaceService.join({ accessCode: joinCode.toUpperCase() })
      setWorkspaces([...workspaces, ws])
      setJoinCode('')
      router.push(`/workspace/${ws.id}/tasks`)
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          alert('Ya eres miembro de este proyecto. Búscalo en tu lista.');
        } else if (err.response?.status === 404) {
          alert('El código no existe. Verifica que esté bien escrito.');
        } else {
          const msg = err.response?.data?.message;
          alert(Array.isArray(msg) ? msg[0] : (msg || 'Error al unirse al espacio.'));
        }
      } else {
        alert('Error de conexión. Intenta de nuevo.');
      }
    } finally {
      setJoining(false)
    }
  }

  const handleOpen = (ws: Workspace) => {
    setActiveWorkspace(ws)
    router.push(`/workspace/${ws.id}/tasks`)
  }

  const filtered = workspaces.filter((ws) => {
    if (filter === 'owner') return ws.role === 'OWNER'
    if (filter === 'member') return ws.role === 'MEMBER'
    return true
  })

  const completedTasks = workspaces.reduce((a, ws) => a + ws.stats.completed_tasks, 0)
  const inProcessTasks = workspaces.reduce((a, ws) => a + ws.stats.in_process_tasks, 0)

  const colorMap: Record<number, string> = {
    0: '#6355E8', 1: '#0D9488', 2: '#D97706', 3: '#E11D48', 4: '#3B82F6',
  }

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
    </div>
  )

  return (
    <>
      {/* Topbar */}
      <header className="topbar">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-date">{today}</p>
        </div>
        <div className="topbar-right">
          <div className="search-bar">
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Buscar espacios, tareas..." />
          </div>
          <button
            className="btn-new-workspace"
            onClick={() => setShowNewWorkspace(true)}
          >
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Nuevo espacio
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="stats-row">
        {[
          { label: 'Espacios activos',   value: workspaces.length, color: 'purple' },
          { label: 'Tareas completadas', value: completedTasks,    color: 'teal'   },
          { label: 'En progreso',        value: inProcessTasks,    color: 'amber'  },
          { label: 'Colaboradores',      value: 0,                 color: 'blue'   },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>
              <svg viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <rect x="11" y="11" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="stat-body">
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Workspaces */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Mis espacios de trabajo</h2>
          <div className="section-actions">
            {(['all', 'owner', 'member'] as const).map((f) => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Todos' : f === 'owner' ? 'Como admin' : 'Como miembro'}
              </button>
            ))}
          </div>
        </div>

        {workspaces.length === 0 ? (
          /* Estado vacío */
          <div className="empty-state">
            <h3 className="empty-title">No tienes espacios de trabajo</h3>
            <p className="empty-sub">Crea uno nuevo o únete con un código</p>
            <div className="join-card-inline">
              <div className="join-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h4 className="join-title">Unirse a un espacio</h4>
              <p className="join-desc">Ingresa el código de acceso de 6 caracteres que te compartieron</p>
              <div className="join-input-row">
                <input
                  type="text"
                  className="code-input"
                  placeholder="A1B2C3"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                />
                <button className="btn-join" onClick={handleJoin} disabled={joining}>
                  {joining ? '...' : 'Unirse'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Grid de workspaces */
          <div className="workspace-grid">
            {filtered.map((ws, i) => (
              <div key={ws.id} className="workspace-card">
                <div className="card-top">
                  <div className="card-header">
                    <div
                      className="workspace-dot"
                      style={{ background: colorMap[i % 5] }}
                    />
                    <span className={`role-badge ${ws.role === 'OWNER' ? 'owner' : 'member'}`}>
                      {ws.role === 'OWNER' ? 'Admin' : 'Miembro'}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-name">{ws.projectName}</h3>
                  <p className="card-desc">{ws.description}</p>
                  <div className="progress-section">
                    <div className="progress-labels">
                      <span>Progreso</span>
                      <span className="progress-pct">{ws.stats.progress_percentage}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${ws.stats.progress_percentage}%`,
                          background: colorMap[i % 5],
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="card-meta">
                    <span className="meta-item">
                      {ws.stats.completed_tasks} / {ws.stats.total_tasks} tareas
                    </span>
                  </div>
                  <button className="card-cta" onClick={() => handleOpen(ws)}>
                    Abrir →
                  </button>
                </div>
              </div>
            ))}

            {/* Join card */}
            <div className="workspace-card join-card">
              <div className="join-content">
                <div className="join-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="join-title">Unirse a un espacio</h3>
                <p className="join-desc">Ingresa el código de acceso de 6 caracteres</p>
                <div className="join-input-row">
                  <input
                    type="text"
                    className="code-input"
                    placeholder="A1B2C3"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  />
                  <button className="btn-join" onClick={handleJoin} disabled={joining}>
                    {joining ? '...' : 'Unirse'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}