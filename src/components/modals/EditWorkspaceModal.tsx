'use client'

import { useState } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { WorkspaceService } from '@/services/workspace.service'
import DeleteWorkspaceModal from '@/components/modals/DeleteWorkspaceModal'
import './modals.css'

const COLORS = [
  '#6355E8', '#0D9488', '#D97706', '#E11D48',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  '#F97316', '#84CC16',
]

interface Props {
  onClose: () => void
  onSaved: () => void
}

export default function EditWorkspaceModal({ onClose, onSaved }: Props) {
  const { activeWorkspace, setActiveWorkspace, workspaces, setWorkspaces } = useWorkspace()

  const [form, setForm] = useState({
    project_name: activeWorkspace?.project_name ?? '',
    description: activeWorkspace?.description ?? '',
  })
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.project_name.trim()) {
      setError('El nombre del proyecto es obligatorio')
      return
    }
    if (!activeWorkspace) return
    setLoading(true)
    try {
      const updated = await WorkspaceService.update(activeWorkspace.id, form)
      setActiveWorkspace(updated)
      setWorkspaces(workspaces.map((ws) => ws.id === updated.id ? updated : ws))
      onSaved()
      onClose()
    } catch {
      setError('Error al guardar los cambios. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="modal-header">
            <div className="modal-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4 16l8.5-8.5 3 3L7 19H4v-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M13 4.5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="modal-title">Editar espacio de trabajo</h2>
              <p className="modal-subtitle">
                {activeWorkspace?.project_name} · Código {activeWorkspace?.access_code}
              </p>
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
                  Nombre del proyecto
                  <span className="modal-required">*</span>
                </label>
                <input
                  type="text"
                  className="modal-input"
                  value={form.project_name}
                  onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                />
                <p className="modal-hint">Este nombre identifica tu espacio en el dashboard</p>
              </div>

              <div className="modal-field">
                <label className="modal-label">
                  Descripción
                  <span className="modal-char-count">{form.description.length} / 200</span>
                </label>
                <textarea
                  className="modal-textarea"
                  maxLength={200}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Color del espacio</label>
                <p className="modal-hint">Se usa para identificarlo visualmente en el dashboard</p>
                <div className="color-picker-row">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`color-opt ${selectedColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Código de acceso (solo lectura) */}
              <div className="modal-field">
                <label className="modal-label">Código de acceso</label>
                <p className="modal-hint">El código no puede modificarse una vez creado el espacio</p>
                <div className="edit-code-readonly">
                  <span className="access-code-val">{activeWorkspace?.access_code ?? '——'}</span>
                  <span className="edit-code-lock">
                    <svg viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M4.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    No editable
                  </span>
                </div>
              </div>

              {error && <p className="modal-error">{error}</p>}

            </div>

            {/* Divider */}
            <div className="modal-divider" />

            {/* Preview side */}
            <div className="modal-preview-side">
              <p className="modal-preview-label">Vista previa</p>

              <div className="preview-card">
                <div className="preview-card-top">
                  <div className="preview-dot" style={{ background: selectedColor }} />
                  <span className="preview-role">Admin</span>
                </div>
                <h3 className="preview-name">
                  {form.project_name || 'Nombre del proyecto'}
                </h3>
                <p className="preview-desc">
                  {form.description || 'La descripción aparecerá aquí...'}
                </p>
                <div className="preview-progress">
                  <div className="preview-progress-labels">
                    <span>Progreso</span>
                    <span>{activeWorkspace?.stats.progress_percentage ?? 0}%</span>
                  </div>
                  <div className="preview-bar">
                    <div
                      className="preview-fill"
                      style={{
                        width: `${activeWorkspace?.stats.progress_percentage ?? 0}%`,
                        background: selectedColor,
                      }}
                    />
                  </div>
                </div>
                <div className="preview-footer">
                  <span className="preview-meta">
                    {activeWorkspace?.stats.total_tasks ?? 0} tareas
                  </span>
                </div>
              </div>

              {/* Danger zone */}
              <div className="edit-danger-zone">
                <div className="edit-danger-header">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path d="M8 2l6 12H2L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                    <path d="M8 6v3M8 11v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <p className="edit-danger-title">Zona de peligro</p>
                </div>
                <p className="edit-danger-desc">
                  Eliminar este espacio borrará todas sus tareas y membresías. Esta acción es irreversible.
                </p>
                <button className="edit-danger-btn" onClick={() => setShowDelete(true)}>
                  <svg viewBox="0 0 16 16" fill="none">
                    <path d="M3 4h10M6 4V2h4v2M5 4v8h6V4H5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Eliminar espacio
                </button>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <p className="modal-footer-note">
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 7v4M8 5.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Solo el administrador puede editar este espacio
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
              <button className="modal-btn-confirm" onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar cambios →'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {showDelete && (
        <DeleteWorkspaceModal onCancel={() => setShowDelete(false)} />
      )}
    </>
  )
}