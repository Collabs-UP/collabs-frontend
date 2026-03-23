'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/context/WorkspaceContext'
import { WorkspaceService } from '@/services/workspace.service'
import './modals.css'

const COLORS = [
  '#6355E8', '#0D9488', '#D97706', '#E11D48',
  '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6',
  '#F97316', '#84CC16',
]

interface Props {
  onClose: () => void
}

export default function NewWorkspaceModal({ onClose }: Props) {
  const router = useRouter()
  const { setActiveWorkspace, workspaces, setWorkspaces } = useWorkspace()
  const [form, setForm] = useState({ project_name: '', description: '' })
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.project_name.trim()) {
      setError('El nombre del proyecto es obligatorio')
      return
    }
    setLoading(true)
    try {
      const ws = await WorkspaceService.create(form)
      setWorkspaces([...workspaces, ws])
      setActiveWorkspace(ws)
      onClose()
      router.push(`/workspace/${ws.id}/tasks`)
    } catch {
      setError('Error al crear el espacio. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const charCount = form.description.length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M4 4h12v12H4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M4 8h12M8 4v12" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h2 className="modal-title">Nuevo espacio de trabajo</h2>
            <p className="modal-subtitle">Configura los detalles de tu proyecto colaborativo</p>
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
                placeholder="Ej. Proyecto Integrador"
                value={form.project_name}
                onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              />
              <p className="modal-hint">Este nombre identificará tu espacio en el dashboard</p>
            </div>

            <div className="modal-field">
              <label className="modal-label">
                Descripción
                <span className="modal-char-count">{charCount} / 200</span>
              </label>
              <textarea
                className="modal-textarea"
                placeholder="Describe el objetivo del proyecto..."
                maxLength={200}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="modal-field">
              <label className="modal-label">Color del espacio</label>
              <p className="modal-hint">Se usará para identificarlo visualmente en el dashboard</p>
              <div className="color-picker-row">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`color-opt ${selectedColor === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                  />
                ))}
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
                  <span>0%</span>
                </div>
                <div className="preview-bar">
                  <div className="preview-fill" style={{ width: '0%', background: selectedColor }} />
                </div>
              </div>
              <div className="preview-footer">
                <span className="preview-meta">0 tareas · 1 miembro</span>
              </div>
            </div>

            <div className="code-preview-block">
              <div className="code-preview-header">
                <svg viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="code-preview-title">Código de acceso generado</p>
              </div>
              <p className="code-preview-sub">Se genera automáticamente al crear el espacio.</p>
              <div className="code-placeholder">
                <span className="code-dash">— — — — — —</span>
                <span className="code-note">Se generará al confirmar</span>
              </div>
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
            Serás asignado automáticamente como administrador
          </p>
          <div className="modal-actions">
            <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
            <button className="modal-btn-confirm" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creando...' : 'Crear espacio →'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}