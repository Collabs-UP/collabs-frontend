import React from 'react';
import './modals.css';

interface Props {
  isOpen: boolean;
  title: string;
  subtitle: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  subtitle,
  confirmText = 'Borrar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="modal-container" 
        style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }} 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Ícono de Alerta (Figma style) */}
        <div style={{ 
          width: '80px', height: '80px', 
          background: '#E11D4830', // Fondo rojo clarito (30% opacidad)
          borderRadius: '24px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        {/* Textos */}
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111128', marginBottom: '12px' }}>
          {title}
        </h2>
        <p style={{ fontSize: '15px', color: '#4E4E72', fontWeight: 500, marginBottom: '32px', lineHeight: '1.5' }}>
          {subtitle}
        </p>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '12px 24px', borderRadius: '12px', border: '2px solid #EDEDF5',
              background: '#FFFFFF', color: '#111128', fontWeight: 600, fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {cancelText}
          </button>
          
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '12px 32px', borderRadius: '12px', border: 'none',
              background: '#E11D48', color: '#FFFFFF', fontWeight: 600, fontSize: '16px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? '...' : confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}