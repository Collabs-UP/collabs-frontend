'use client'

import { useState, useRef, useEffect } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { WorkspaceService } from '@/services/workspace.service'
import './modals.css'
import axios from 'axios';
import { useRouter } from 'next/navigation'

interface Props {
  onClose: () => void
}

export default function JoinWorkspacePopup({ onClose }: Props) {
  const { workspaces, setWorkspaces } = useWorkspace()
  const [code, setCode] = useState('')
  const router = useRouter();
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const handleJoin = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 caracteres')
      return
    }
    setError('')
    setJoining(true)
    try {
      const ws = await WorkspaceService.join({ accessCode: code.toUpperCase() })
      setWorkspaces([...workspaces, ws])
      onClose()
      router.push(`/workspace/${ws.id}/tasks`)
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setError('Ya eres miembro de este proyecto.');
        } else if (err.response?.status === 404) {
          setError('Código no encontrado.');
        } else {
          const msg = err.response?.data?.message;
          setError(Array.isArray(msg) ? msg[0] : (msg || 'Error al unirse.'));
        }
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="join-popup" ref={ref}>
      <div className="join-popup-icon">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="join-popup-title">Unirse a un espacio</p>
      <p className="join-popup-desc">
        Ingresa el código de acceso de 6 caracteres que te compartieron
      </p>
      <div className="join-popup-row">
        <input
          type="text"
          className="join-popup-input"
          placeholder="A1B2C3"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          autoFocus
        />
        <button
          className="join-popup-btn"
          onClick={handleJoin}
          disabled={joining}
        >
          {joining ? '...' : 'Unirse'}
        </button>
      </div>
      {error && <p className="join-popup-error">{error}</p>}
    </div>
  )
}