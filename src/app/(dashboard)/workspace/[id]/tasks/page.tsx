'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import { WorkspaceService } from '@/services/workspace.service'
import { TaskService } from '@/services/task.service'
import type { Task, TaskSummary } from '@/types'
import NewTaskModal from '@/components/modals/NewTaskModal'
import EditWorkspaceModal from '@/components/modals/EditWorkspaceModal'
import ConfirmModal from '@/components/modals/ConfirmModal'

export default function WorkspaceTasksPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { activeWorkspace, setActiveWorkspace, workspaces, setWorkspaces } = useWorkspace()

  const [tasks, setTasks] = useState<Task[]>([])
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in_process' | 'completed'>('all')
  const [showNewTask, setShowNewTask] = useState(false)
  const [showEditWorkspace, setShowEditWorkspace] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Estados para el modal de eliminar tarea
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [taskToRemove, setTaskToRemove] = useState<Task | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, workspaces.length])

  useEffect(() => {
    if (!id) return
    TaskService.getByWorkspace(id)
      .then((res) => {
        setTasks(res.tasks || [])
        // Aseguramos que los contadores sean números
        setSummary({
          total_tasks: Number(res.summary?.total_tasks) || 0,
          completed_tasks: Number(res.summary?.completed_tasks) || 0,
          in_process_tasks: Number(res.summary?.in_process_tasks) || 0,
          progress_percentage: Number(res.summary?.progress_percentage) || 0
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const handleToggleTask = async (task: Task) => {
    const assignee = (task as any).assignedTo || task.assigned_to || { id: 'unknown' };
    
    // Solo permitimos marcarla si es mía o si soy el dueño del proyecto
    const isOwner = activeWorkspace?.role === 'OWNER'
    if (assignee.id !== user?.id && !isOwner) return
    
    if (task.status === 'COMPLETED') return
    try {
      const updated = await TaskService.updateStatus(task.id, { status: 'COMPLETED' })
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      
      setSummary((prev) => {
        if (!prev) return prev
        const total = prev.total_tasks
        const completed = prev.completed_tasks + 1
        const inProcess = Math.max(0, prev.in_process_tasks - 1)
        return {
          ...prev,
          completed_tasks: completed,
          in_process_tasks: inProcess,
          progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        }
      })
    } catch {}
  }

  const handleRemoveTask = async () => {
    if (!taskToRemove || !id) return;
    setIsRemoving(true);
    try {
      await TaskService.remove(id, taskToRemove.id);
      
      setTasks(tasks.filter(t => t.id !== taskToRemove.id));
      
      setSummary((prev) => {
        if (!prev) return prev;
        const total = Math.max(0, prev.total_tasks - 1);
        const completed = taskToRemove.status === 'COMPLETED' ? Math.max(0, prev.completed_tasks - 1) : prev.completed_tasks;
        const inProcess = taskToRemove.status === 'IN_PROCESS' ? Math.max(0, prev.in_process_tasks - 1) : prev.in_process_tasks;
        return {
          ...prev,
          total_tasks: total,
          completed_tasks: completed,
          in_process_tasks: inProcess,
          progress_percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      });

      setTaskToRemove(null);
    } catch (error) {
      alert("Error al eliminar la tarea");
    } finally {
      setIsRemoving(false);
    }
  }

  const handleCopyCode = () => {
    if (!activeWorkspace?.accessCode) return
    navigator.clipboard.writeText(activeWorkspace.accessCode)
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
    const assignee = (t as any).assignedTo || t.assigned_to || { id: 'unknown' };
    if (!memberColors[assignee.id]) {
      memberColors[assignee.id] = colorList[Object.keys(memberColors).length % 5]
    }
  })

  const getInitials = (name: string) => name ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'

  const formatDate = (date: string) => {
    if (!date) return { label: 'Sin fecha', overdue: false }
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
      <header className="topbar">
        <div className="workspace-breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>{activeWorkspace?.projectName ?? 'Workspace'}</span>
        </div>
      </header>

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
            <h1 className="workspace-title">{activeWorkspace?.projectName ?? '—'}</h1>
            <p className="workspace-desc">{activeWorkspace?.description ?? ''}</p>
            <div className="workspace-meta-row">
              <div className="access-code-chip">
                <span className="access-code-label">Código</span>
                <span className="access-code-val">{activeWorkspace?.accessCode ?? '——'}</span>
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
            </div>
          </div>

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

      <div className="task-section">
        <div className="task-toolbar">
          <div className="task-filters">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              Todas ({tasks.length})
            </button>
            <button className={`filter-btn ${filter === 'in_process' ? 'active' : ''}`} onClick={() => setFilter('in_process')}>
              En proceso ({summary?.in_process_tasks ?? 0})
            </button>
            <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
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
              const assignee = (task as any).assignedTo || task.assigned_to || { id: 'unknown', name: 'Desconocido' };
              const dateString = (task as any).dueDate || task.due_date || '';
              
              const isResponsible = assignee.id === user?.id
              const done = task.status === 'COMPLETED'
              const { label, overdue } = formatDate(dateString)
              const color = memberColors[assignee.id] ?? colorList[0]

              // Evaluamos si el usuario actual tiene permisos para eliminar ESTA tarea
              const canDelete = isOwner || isResponsible;

              return (
                <div key={task.id} className="task-row">
                  <div
                    className={`task-check ${done ? 'done' : ''} ${(!isResponsible && !isOwner) || done ? 'disabled' : ''}`}
                    onClick={() => handleToggleTask(task)}
                    title={(!isResponsible && !isOwner) ? 'Solo el responsable o el admin pueden completar esta tarea' : ''}
                  >
                    {done && (
                      <svg viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>

                  <div className="task-title-cell">
                    <span className={`task-title ${done ? 'done' : ''}`}>{task.title}</span>
                    <span className="task-id">#{task?.id ? task.id.slice(0, 8).toUpperCase() : 'ERR'}</span>
                  </div>

                  <div className="assignee-cell">
                    <div className="task-avatar" style={{ background: `${color}20`, color }}>
                      {getInitials(assignee.name)}
                    </div>
                    <span className="assignee-name">{assignee.name}</span>
                  </div>

                  <div className={`due-date-cell ${overdue && !done ? 'overdue' : ''}`}>
                    {label}
                  </div>

                  <div>
                    <span className={`status-pill ${done ? 'completed' : 'in-process'}`}>
                      {done ? 'Completada' : 'En proceso'}
                    </span>
                  </div>

                  {/* Menú de los 3 puntitos para Tareas */}
                  <div style={{ position: 'relative' }}>
                    {canDelete && (
                      <>
                        <button 
                          className="task-menu-btn"
                          onClick={() => setMenuOpenId(menuOpenId === task.id ? null : task.id)}
                        >
                          <svg viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="3" r="1" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1" fill="currentColor"/>
                            <circle cx="8" cy="13" r="1" fill="currentColor"/>
                          </svg>
                        </button>

                        {menuOpenId === task.id && (
                          <div style={{
                            position: 'absolute', right: '36px', top: '-5px',
                            background: 'white', border: '1px solid var(--border)', borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, minWidth: '160px', overflow: 'hidden'
                          }}>
                            <button 
                              onClick={() => { setTaskToRemove(task); setMenuOpenId(null); }}
                              style={{
                                width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none',
                                border: 'none', color: '#E11D48', fontSize: '14px', fontWeight: 500,
                                cursor: 'pointer'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = '#E11D4810'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                            >
                              Eliminar tarea
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

      {showNewTask && (
        <NewTaskModal
          workspaceId={id}
          workspaceName={activeWorkspace?.projectName ?? ''}
          onClose={() => setShowNewTask(false)}
          onCreated={(task) => {
            setTasks((prev) => [...prev, task])
            setSummary((prev) => {
              if (!prev) return prev
              const total = prev.total_tasks + 1
              const inProcess = prev.in_process_tasks + 1
              return {
                ...prev,
                total_tasks: total,
                in_process_tasks: inProcess,
                progress_percentage: Math.round((prev.completed_tasks / total) * 100),
              }
            })
          }}
        />
      )}
      
      {showEditWorkspace && (
        <EditWorkspaceModal
          onClose={() => setShowEditWorkspace(false)}
          onSaved={() => {}}
        />
      )}

      {/* Renderizamos el Modal al final */}
      <ConfirmModal
        isOpen={!!taskToRemove}
        title="¿Estás seguro de eliminar esta tarea?"
        subtitle={`La tarea "${taskToRemove?.title}" será borrada permanentemente. Esta acción no se puede deshacer.`}
        confirmText="Eliminar tarea"
        onConfirm={handleRemoveTask}
        onCancel={() => setTaskToRemove(null)}
        isLoading={isRemoving}
      />
    </>
  )
}