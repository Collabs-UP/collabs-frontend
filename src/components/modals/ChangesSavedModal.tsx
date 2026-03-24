'use client'

import './modals.css'

interface Props {
  onContinue: () => void
}

export default function ChangesSavedModal({ onContinue }: Props) {
  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-icon success">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3 className="confirm-title">Cambios guardados exitosamente</h3>
        <button className="confirm-btn-continue" onClick={onContinue}>
          Continuar
        </button>
      </div>
    </div>
  )
}