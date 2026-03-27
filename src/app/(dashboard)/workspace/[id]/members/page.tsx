'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { MemberService } from '@/services/member.service'
import type { Member } from '@/types'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { WorkspaceService } from '@/services/workspace.service'

export default function WorkspaceMembersPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { activeWorkspace, setActiveWorkspace, workspaces, setWorkspaces } = useWorkspace()
  
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)
  
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  
  const isOwner = activeWorkspace?.role === 'OWNER'

  useEffect(() => {
    if (workspaces.length > 0) {
      const ws = workspaces.find((w) => w.id === id)
      if (ws && ws.id !== activeWorkspace?.id) {
        setActiveWorkspace(ws)
      }
    } else {
      WorkspaceService.getAll().then((data) => {
        if (setWorkspaces) setWorkspaces(data)
        const ws = data.find((w) => w.id === id)
        if (ws) setActiveWorkspace(ws)
      }).catch(() => {})
    }
  }, [id, workspaces.length])

  useEffect(() => {
    if (!id) return
    MemberService.getByWorkspace(id)
      .then((res) => setMembers(res.members))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleCopy = () => {
    if (!activeWorkspace?.accessCode) return
    navigator.clipboard.writeText(activeWorkspace.accessCode)
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

  const totalCompleted = members.reduce((a, m) => {
    const stats = (m as any).taskStats || m.task_stats || {};
    return a + (stats.completedTasks || stats.completed_tasks || 0);
  }, 0)
  
  const totalInProcess = members.reduce((a, m) => {
    const stats = (m as any).taskStats || m.task_stats || {};
    return a + (stats.inProcessTasks || stats.in_process_tasks || 0);
  }, 0)
  
  const totalTasks = members.reduce((a, m) => {
    const stats = (m as any).taskStats || m.task_stats || {};
    return a + (stats.assignedTasks || stats.assigned_tasks || 0);
  }, 0)

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
    </div>
  )

  const handleRemoveMember = async () => {
    if (!memberToRemove || !id) return;
    setIsRemoving(true);
    try {
      await MemberService.remove(id, memberToRemove.id);
      
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      setMemberToRemove(null);
    } catch (error) {
      alert("Error al eliminar al miembro");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      {/* Topbar */}
      <header className="topbar">
        <div>
          <h1 className="page-title">Miembros</h1>
          <p className="page-date">
            {activeWorkspace?.projectName} · {members.length} miembros
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
                {ws.projectName}
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
            <span className="access-code-val">{activeWorkspace?.accessCode ?? '——'}</span>
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
              
              const stats = (member as any).taskStats || member.task_stats || {};
              const assigned = stats.assignedTasks || stats.assigned_tasks || 0;
              const completed = stats.completedTasks || stats.completed_tasks || 0;
              const inProcess = stats.inProcessTasks || stats.in_process_tasks || 0;

              const pct = assigned > 0
                ? Math.round((completed / assigned) * 100)
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
                  <div className="member-num">{assigned}</div>
                  <div className="member-num teal">{completed}</div>
                  <div className="member-num amber">{inProcess}</div>
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
                  
                  {/* Menú de los 3 puntitos */}
                  <div style={{ position: 'relative' }}>
                    {isOwner && member.id !== user?.id && (
                      <>
                        <button 
                          className="task-menu-btn"
                          onClick={() => setMenuOpenId(menuOpenId === member.id ? null : member.id)}
                        >
                          <svg viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="3" r="1" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1" fill="currentColor"/>
                            <circle cx="8" cy="13" r="1" fill="currentColor"/>
                          </svg>
                        </button>

                        {/* El Dropdown flotante */}
                        {menuOpenId === member.id && (
                          <div style={{
                            position: 'absolute', right: '36px', top: '-5px', marginTop: '4px',
                            background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '160px', overflow: 'hidden'
                          }}>
                            <button 
                              onClick={() => { setMemberToRemove(member); setMenuOpenId(null); }}
                              style={{
                                width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none',
                                border: 'none', color: '#E11D48', fontSize: '14px', fontWeight: 500,
                                cursor: 'pointer'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#E11D4810'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                              Eliminar miembro
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Renderizamos el Modal al final */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        title="¿Estás seguro de eliminar a este miembro?"
        subtitle={`Esta acción es irreversible y ${memberToRemove?.name} perderá acceso al proyecto y a sus tareas asignadas.`}
        confirmText="Eliminar"
        onConfirm={handleRemoveMember}
        onCancel={() => setMemberToRemove(null)}
        isLoading={isRemoving}
      />
    </>
  )
}