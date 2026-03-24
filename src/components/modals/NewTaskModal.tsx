'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { MemberService } from '@/services/member.service'
import { TaskService } from '@/services/task.service'
import type { Member, Task } from '@/types'
import './modals.css'

interface Props {
  workspaceId: string
  workspaceName: string
  onClose: () => void
  onCreated: (task: Task) => void
}

export default function NewTaskModal({
  workspaceId,
  workspaceName,
  onClose,
  onCreated,
}: Props) {
  const { user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigned_to_id: '',
    due_date: '',
  })
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    MemberService.getByWorkspace(workspaceId)
      .then((res) => {
        setMembers(res.members)
        if (res.members.length > 0) {
          setForm((f) => ({ ...f, assigned_to_id: res.members[0].id }))
        }
      })
      .catch(() => {})
  }, [workspaceId])

  const selectedMember = members.find((m) => m.id === form.assigned_to_id)

  const memberColors: Record<string, string> = {}
  const colorList = ['#6355E8', '#0D9488', '#D97706', '#E11D48', '#3B82F6']
  members.forEach((m, i) => {
    memberColors[m.id] = colorList[i % 5]
  })

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    if (!form.assigned_to_id) { setError('Debes asignar un responsable'); return }
    if (!form.due_date) { setError('La fecha límite es obligatoria'); return }
    setError('')
    setLoading(true)
    try {
      const task = await TaskService.create(workspaceId, form)
      onCreated(task)
      onClose()
    } catch {
      setError('Error al crear la tarea. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container task-modal-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon" style={{ background: 'var(--teal-dim)', borderColor: 'rgba(13,148,136,0.2)', color: 'var(--teal)' }}>
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h2 className="modal-title">Nueva tarea</h2>
            <p className="modal-subtitle">{workspaceName} · #TASK-{Date.now().toString().slice(-3)}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Form side */}
          <div className="modal-form-side">

            <div className="modal-field">
              <label className="modal-label">
                Título de la tarea
                <span className="modal-required">*</span>
              </label>
              <input
                type="text"
                className="modal-input"
                placeholder="Ej. Implementar endpoint de tareas"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">
                Descripción
                <span className="modal-char-count">{form.description.length} / 500</span>
              </label>
              <textarea
                className="modal-textarea"
                placeholder="Describe qué debe hacerse..."
                maxLength={500}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Meta row */}
            <div className="task-meta-grid">

              {/* Responsable */}
              <div className="modal-field">
                <label className="modal-label">
                  Responsable
                  <span className="modal-required">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <div
                    className="task-member-select"
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                  >
                    {selectedMember ? (
                      <>
                        <div
                          className="task-avatar"
                          style={{
                            background: `${memberColors[selectedMember.id]}20`,
                            color: memberColors[selectedMember.id],
                          }}
                        >
                          {getInitials(selectedMember.name)}
                        </div>
                        <span className="task-member-name">{selectedMember.name}</span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Seleccionar...</span>
                    )}
                    <svg className="task-chevron" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {showMemberDropdown && (
                    <div className="task-member-dropdown">
                      {members.map((m) => (
                        <div
                          key={m.id}
                          className="task-member-option"
                          onClick={() => {
                            setForm({ ...form, assigned_to_id: m.id })
                            setShowMemberDropdown(false)
                          }}
                        >
                          <div
                            className="task-avatar"
                            style={{
                              background: `${memberColors[m.id]}20`,
                              color: memberColors[m.id],
                            }}
                          >
                            {getInitials(m.name)}
                          </div>
                          <span>{m.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fecha límite */}
              <div className="modal-field">
                <label className="modal-label">
                  Fecha límite
                  <span className="modal-required">*</span>
                </label>
                <input
                  type="date"
                  className="modal-input"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Estado inicial */}
              <div className="modal-field">
                <label className="modal-label">Estado inicial</label>
                <div className="task-status-display">
                  <span className="status-dot-sm amber" />
                  <span>En proceso</span>
                </div>
              </div>

            </div>

            {error && <p className="modal-error">{error}</p>}

          </div>

          {/* Divider */}
          <div className="modal-divider" />

          {/* Side info */}
          <div className="modal-preview-side">

            <div className="task-side-block">
              <p className="task-side-label">
                <svg viewBox="0 0 14 14" fill="none">
                  <path d="M4 4h6v6H4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  <path d="M4 7h6M7 4v6" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Espacio de trabajo
              </p>
              <div className="task-ws-chip">
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                <span>{workspaceName}</span>
              </div>
            </div>

            <div className="task-side-block">
              <p className="task-side-label">
                <svg viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Miembros del equipo
              </p>
              <div className="task-members-list">
                {members.map((m) => (
                  <div key={m.id} className="task-member-row">
                    <div
                      className="task-avatar"
                      style={{
                        background: `${memberColors[m.id]}20`,
                        color: memberColors[m.id],
                      }}
                    >
                      {getInitials(m.name)}
                    </div>
                    <div>
                      <p className="task-member-row-name">{m.name}</p>
                      <p className="task-member-row-role">
                        {m.role === 'OWNER' ? 'Admin' : 'Miembro'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="task-note-block">
              <p className="task-side-label">
                <svg viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 6v3M7 4.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Nota
              </p>
              <p className="task-note-text">
                Solo el <strong>responsable</strong> asignado podrá marcar esta tarea como completada.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="modal-btn-confirm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear tarea →'}
          </button>
        </div>

      </div>
    </div>
  )
}