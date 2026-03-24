'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { TaskService } from '@/services/task.service'
import type { Task, TaskSummary } from '@/types'
import NewTaskModal from '@/components/modals/NewTaskModal'
import EditWorkspaceModal from '@/components/modals/EditWorkspaceModal'

export default function WorkspaceTasksPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { activeWorkspace, setActiveWorkspace, workspaces } = useWorkspace()

  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in_process' | 'completed'>('all')
  const [showNewTask, setShowNewTask] = useState(false)
  const [showEditWorkspace, setShowEditWorkspace] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!activeWorkspace && workspaces.length > 0) {
      const ws = workspaces.find((w) => w.id === id)
      if (ws) setActiveWorkspace(ws)
    }
  }, [id, activeWorkspace, workspaces, setActiveWorkspace])

  useEffect(() => {
    if (!id) return
    TaskService.getByWorkspace(id)
      .then((res) => {
        setTasks(res.tasks)
        setSummary(res.summary)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleToggleTask = async (task: Task) => {
    if (task.assigned_to.id !== user?.id) return
    if (task.status === 'COMPLETED') return
    try {
      const updated = await TaskService.updateStatus(task.id, { status: 'COMPLETED' })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setSummary((prev) => prev ? {
        ...prev,
        completed_tasks: prev.completed_tasks + 1,
        in_process_tasks: prev.in_process_tasks - 1,
        progress_percentage: Math.round(((prev.completed_tasks + 1) / prev.total_tasks) * 100),
      } : prev)
    } catch {}
  }

  const handleCopyCode = () => {
    if (!activeWorkspace?.access_code) return
    navigator.clipboard.writeText(activeWorkspace.access_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filtered = tasks.filter((t) => {
    if (filter === 'in_process') return t.status === 'IN_PROCESS'
    if (filter === 'completed') return t.status === 'COMPLETED'
    return true
  })

  const isOwner = activeWorkspace?.role === 'OWNER'

  const colorList = ['#6355E8', '#0D9488', '#D97706', '#E11D48', '#3B82F6']
  const memberColors: Record<string, string> = {}
  tasks.forEach((t) => {
    if (!memberColors[t.assigned_to.id]) {
      memberColors[t.assigned_to.id] = colorList[Object.keys(memberColors).length % 5]
    }
  })

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    return {
      label: d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
      overdue: d < today,
    }
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
        <div className="workspace-breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{activeWorkspace?.project_name ?? 'Workspace'}</span>
        </div>
      </header>

      {/* Workspace header card */}
      <section className="workspace-header">
        <div className="workspace-header-inner">

          <div className="workspace-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
                Espacio de trabajo
              </span>
              <span className={`role-badge ${isOwner ? 'owner' : 'member'}`}>
                {isOwner ? 'Admin' : 'Miembro'}
              </span>
            </div>
            <h1 className="workspace-title">{activeWorkspace?.project_name ?? '—'}</h1>
            <p className="workspace-desc">{activeWorkspace?.description ?? ''}</p>
            <div className="workspace-meta-row">
              <div className="access-code-chip">
                <span className="access-code-label">Código</span>
                <span className="access-code-val">{activeWorkspace?.access_code ?? '——'}</span>
                <button className="copy-btn" onClick={handleCopyCode} title={copied ? '¡Copiado!' : 'Copiar'}>
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
              {activeWorkspace?.owner && (
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  Creado por {activeWorkspace.owner.name}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="workspace-stats-col">
            <div className="big-progress">
              <div className="big-progress-header">
                <span className="big-progress-label">Progreso general</span>
                <span className="big-progress-pct">{summary?.progress_percentage ?? 0}%</span>
              </div>
              <div className="big-progress-bar">
                <div
                  className="big-progress-fill"
                  style={{ width: `${summary?.progress_percentage ?? 0}%` }}
                />
              </div>
            </div>
            <div className="task-mini-stats">
              <div className="mini-stat">
                <div className="mini-stat-val teal">{summary?.completed_tasks ?? 0}</div>
                <div className="mini-stat-label">Completadas</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-val amber">{summary?.in_process_tasks ?? 0}</div>
                <div className="mini-stat-label">En proceso</div>
              </div>
              <div className="mini-stat">
                <div className="mini-stat-val">{summary?.total_tasks ?? 0}</div>
                <div className="mini-stat-label">Total</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isOwner && (
            <div className="workspace-actions">
              <button className="btn-outline" onClick={() => setShowEditWorkspace(true)}>
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M4 16l8.5-8.5 3 3L7 19H4v-3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                Editar
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Task section */}
      <div className="task-section">
        <div className="task-toolbar">
          <div className="task-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Todas ({tasks.length})
            </button>
            <button
              className={`filter-btn ${filter === 'in_process' ? 'active' : ''}`}
              onClick={() => setFilter('in_process')}
            >
              En proceso ({summary?.in_process_tasks ?? 0})
            </button>
            <button
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completadas ({summary?.completed_tasks ?? 0})
            </button>
          </div>
          {isOwner && (
            <div className="task-actions">
              <button className="btn-primary-sm" onClick={() => setShowNewTask(true)}>
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Nueva Tarea
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)' }}>
            <p style={{ fontSize: 15 }}>No hay tareas en esta categoría</p>
          </div>
        ) : (
          <div className="task-table">
            <div className="task-table-header">
              <div className="th"></div>
              <div className="th">Tarea</div>
              <div className="th">Responsable</div>
              <div className="th">Fecha límite</div>
              <div className="th">Estado</div>
              <div className="th"></div>
            </div>

            {filtered.map((task) => {
              const isResponsible = task.assigned_to.id === user?.id
              const done = task.status === 'COMPLETED'
              const { label, overdue } = formatDate(task.due_date)
              const color = memberColors[task.assigned_to.id] ?? colorList[0]

              return (
                <div key={task.id} className="task-row">
                  <div
                    className={`task-check ${done ? 'done' : ''} ${!isResponsible || done ? 'disabled' : ''}`}
                    onClick={() => handleToggleTask(task)}
                    title={!isResponsible ? 'Solo el responsable puede completar esta tarea' : ''}
                  >
                    {done && (
                      <svg viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  <div className="task-title-cell">
                    <span className={`task-title ${done ? 'done' : ''}`}>{task.title}</span>
                    <span className="task-id">#{task.id.slice(0, 8).toUpperCase()}</span>
                  </div>

                  <div className="assignee-cell">
                    <div
                      className="task-avatar"
                      style={{ background: `${color}20`, color }}
                    >
                      {getInitials(task.assigned_to.name)}
                    </div>
                    <span className="assignee-name">{task.assigned_to.name}</span>
                  </div>

                  <div className={`due-date-cell ${overdue && !done ? 'overdue' : ''}`}>
                    {label}
                  </div>

                  <div>
                    <span className={`status-pill ${done ? 'completed' : 'in-process'}`}>
                      {done ? 'Completada' : 'En proceso'}
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

      {/* Modales */}
      {showNewTask && (
        <NewTaskModal
          workspaceId={id}
          workspaceName={activeWorkspace?.project_name ?? ''}
          onClose={() => setShowNewTask(false)}
          onCreated={(task) => {
            setTasks((prev) => [...prev, task])
            setSummary((prev) => prev ? {
              ...prev,
              total_tasks: prev.total_tasks + 1,
              in_process_tasks: prev.in_process_tasks + 1,
            } : prev)
          }}
        />
      )}
      {showEditWorkspace && (
        <EditWorkspaceModal
          onClose={() => setShowEditWorkspace(false)}
          onSaved={() => {}}
        />
      )}
    </>
  )
}