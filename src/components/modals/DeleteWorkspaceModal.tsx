'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/context/WorkspaceContext'
import { WorkspaceService } from '@/services/workspace.service'
import './modals.css'

interface Props {
  onCancel: () => void
}

export default function DeleteWorkspaceModal({ onCancel }: Props) {
  const router = useRouter()
  const { activeWorkspace, setActiveWorkspace, workspaces, setWorkspaces } = useWorkspace()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!activeWorkspace) return
    setLoading(true)
    try {
      await WorkspaceService.delete(activeWorkspace.id)
      setWorkspaces(workspaces.filter((ws) => ws.id !== activeWorkspace.id))
      setActiveWorkspace(null)
      router.push('/dashboard')
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-icon danger">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="confirm-title">¿Estás seguro de eliminar este espacio?</h3>
        <p className="confirm-desc">
          Esta acción es irreversible y perderás todas las tareas y membresías
        </p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="confirm-btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Borrando...' : 'Borrar'}
          </button>
        </div>
      </div>
    </div>
  )
}