'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useWorkspace } from '@/context/WorkspaceContext'
import { MemberService } from '@/services/member.service'
import type { Member } from '@/types'

export default function WorkspaceMembersPage() {
  const { id } = useParams<{ id: string }>()
  const { activeWorkspace, setActiveWorkspace, workspaces } = useWorkspace()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!activeWorkspace && workspaces.length > 0) {
      const ws = workspaces.find((w) => w.id === id)
      if (ws) setActiveWorkspace(ws)
    }
  }, [id, activeWorkspace, workspaces, setActiveWorkspace])

  useEffect(() => {
    if (!id) return
    MemberService.getByWorkspace(id)
      .then((res) => setMembers(res.members))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleCopy = () => {
    if (!activeWorkspace?.access_code) return
    navigator.clipboard.writeText(activeWorkspace.access_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  )

  const colorList = ['#6355E8', '#0D9488', '#D97706', '#E11D48', '#3B82F6']
  const memberColors: Record<string, string> = {}
  members.forEach((m, i) => { memberColors[m.id] = colorList[i % 5] })

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const totalCompleted = members.reduce((a, m) => a + m.task_stats.completed_tasks, 0)
  const totalInProcess = members.reduce((a, m) => a + m.task_stats.in_process_tasks, 0)
  const totalTasks = members.reduce((a, m) => a + m.task_stats.assigned_tasks, 0)

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
          <h1 className="page-title">Miembros</h1>
          <p className="page-date">
            {activeWorkspace?.project_name} · {members.length} miembros
          </p>
        </div>
        <div className="topbar-right">
          <div className="search-bar">
            <svg viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M15 15l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar miembros..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="members-content">

        {/* Workspace selector tabs */}
        <div className="members-ws-selector">
          <p className="members-ws-label">Espacio de trabajo</p>
          <div className="members-ws-tabs">
            {workspaces.map((ws, i) => (
              <button
                key={ws.id}
                className={`members-ws-tab ${ws.id === id ? 'active' : ''}`}
              >
                <div
                  className="members-ws-dot"
                  style={{ background: colorList[i % 5] }}
                />
                {ws.project_name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { label: 'Miembros activos',   value: members.length, color: 'purple' },
            { label: 'Tareas completadas', value: totalCompleted,  color: 'teal'   },
            { label: 'En progreso',        value: totalInProcess,  color: 'amber'  },
            { label: 'Tareas totales',     value: totalTasks,      color: 'blue'   },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className={`stat-icon ${s.color}`}>
                <svg viewBox="0 0 20 20" fill="none">
                  <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 17c0-3.3 2.7-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="14" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 17c0-2.2 1.8-4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Invite block */}
        <div className="members-invite-block">
          <div className="members-invite-left">
            <div className="members-invite-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 17c0-3.3 2.7-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15 9l2 2-2 2M17 11h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="members-invite-title">Invitar a un nuevo miembro</p>
              <p className="members-invite-desc">
                Comparte el código de acceso para que se unan al espacio
              </p>
            </div>
          </div>
          <div className="members-code-chip">
            <span className="members-code-label">Código</span>
            <span className="access-code-val">{activeWorkspace?.access_code ?? '——'}</span>
            <button className="copy-btn" onClick={handleCopy} title={copied ? '¡Copiado!' : 'Copiar'}>
              {copied ? (
                <svg viewBox="0 0 14 14" fill="none">
                  <path d="M2 7l3.5 3.5L12 3" stroke="var(--teal)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 14 14" fill="none">
                  <rect x="5" y="5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M2 9V2h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Members table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
            <p style={{ fontSize: 15 }}>No se encontraron miembros</p>
          </div>
        ) : (
          <div className="members-table">
            <div className="members-table-header">
              <div className="th">Miembro</div>
              <div className="th">Asignadas</div>
              <div className="th">Completadas</div>
              <div className="th">En proceso</div>
              <div className="th">Progreso</div>
              <div className="th">Rol</div>
              <div className="th"></div>
            </div>

            {filtered.map((member) => {
              const color = memberColors[member.id] ?? colorList[0]
              const pct = member.task_stats.assigned_tasks > 0
                ? Math.round((member.task_stats.completed_tasks / member.task_stats.assigned_tasks) * 100)
                : 0

              return (
                <div key={member.id} className="members-table-row">
                  <div className="member-cell">
                    <div
                      className="member-avatar-md"
                      style={{ background: `${color}20`, color }}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <p className="member-name-text">{member.name}</p>
                      <p className="member-email-text">{member.email}</p>
                    </div>
                  </div>
                  <div className="member-num">{member.task_stats.assigned_tasks}</div>
                  <div className="member-num teal">{member.task_stats.completed_tasks}</div>
                  <div className="member-num amber">{member.task_stats.in_process_tasks}</div>
                  <div className="member-progress-cell">
                    <div className="member-progress-bar">
                      <div
                        className="member-progress-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="member-pct">{pct}%</span>
                  </div>
                  <div>
                    <span className={`role-badge ${member.role === 'OWNER' ? 'owner' : 'member'}`}>
                      {member.role === 'OWNER' ? 'Admin' : 'Miembro'}
                    </span>
                  </div>
                  <button className="task-menu-btn">
                    <svg viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="3" r="1" fill="currentColor"/>
                      <circle cx="8" cy="8" r="1" fill="currentColor"/>
                      <circle cx="8" cy="13" r="1" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}