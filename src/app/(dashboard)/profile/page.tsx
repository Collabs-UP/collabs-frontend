'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import ChangesSavedModal from '@/components/modals/ChangesSavedModal'
import DeleteAccountModal from '@/components/modals/DeleteAccountModal'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { workspaces } = useWorkspace()
  const [showSaved, setShowSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })
  const [saving, setSaving] = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  const completedTasks = workspaces.reduce((a, ws) => a + ws.stats.completed_tasks, 0)
  const inProcessTasks = workspaces.reduce((a, ws) => a + ws.stats.in_process_tasks, 0)
  const adminCount = workspaces.filter((ws) => ws.role === 'OWNER').length

  const handleSave = async () => {
    setSaving(true)
    // TODO: reemplazar con PUT /api/users/me cuando el backend esté listo
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    setShowSaved(true)
  }

  const colorMap: Record<number, string> = {
    0: '#6355E8', 1: '#0D9488', 2: '#D97706', 3: '#E11D48', 4: '#3B82F6',
  }

  return (
    <>
      {/* Topbar */}
      <header className="topbar">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-date">Gestiona tu información personal y seguridad</p>
        </div>
      </header>

      {/* Content */}
      <div className="profile-content">

        {/* LEFT — Avatar + Actividad */}
        <div className="profile-left">

          <div className="profile-card">
            <div className="profile-avatar-big">
              {initials}
              <button className="avatar-edit-btn">
                <svg viewBox="0 0 12 12" fill="none">
                  <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="profile-name">{user?.name ?? 'Usuario'}</p>
            <p className="profile-email">{user?.email ?? ''}</p>
          </div>

          <div className="profile-stats-card">
            <p className="profile-stats-title">Actividad</p>
            <div className="profile-stats-grid">
              <div className="pstat">
                <div className="pstat-val accent">{workspaces.length}</div>
                <div className="pstat-label">Espacios</div>
              </div>
              <div className="pstat">
                <div className="pstat-val teal">{completedTasks}</div>
                <div className="pstat-label">Completadas</div>
              </div>
              <div className="pstat">
                <div className="pstat-val amber">{inProcessTasks}</div>
                <div className="pstat-label">En proceso</div>
              </div>
              <div className="pstat">
                <div className="pstat-val">{adminCount}</div>
                <div className="pstat-label">Admin de</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT — Formularios */}
        <div className="profile-right">

          {/* Información personal */}
          <div className="form-card">
            <h3 className="form-card-title">Información personal</h3>
            <p className="form-card-sub">Actualiza tu nombre y correo electrónico</p>
            <div className="form-row">
              <div className="field-group-sm">
                <label className="field-label-sm">Nombre completo</label>
                <input
                  type="text"
                  className="form-input-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="field-group-sm">
                <label className="field-label-sm">Correo electrónico</label>
                <input
                  type="email"
                  className="form-input-sm"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>
            <div className="form-card-footer">
              <button
                className="btn-cancel-sm"
                onClick={() => setForm({ name: user?.name ?? '', email: user?.email ?? '' })}
              >
                Cancelar
              </button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button className="btn-delete-account" onClick={() => setShowDelete(true)}>
                Eliminar cuenta
              </button>
            </div>
          </div>

          {/* Seguridad */}
          <div className="form-card">
            <h3 className="form-card-title">Seguridad</h3>
            <p className="form-card-sub">Administra tu contraseña y sesiones activas</p>
            <div className="security-row">
              <div className="security-info">
                <span className="security-label">Contraseña</span>
                <span className="security-sub">Última actualización: hace 2 semanas</span>
              </div>
              <button className="btn-cancel-sm">Cambiar contraseña</button>
            </div>
            <div className="security-row">
              <div className="security-info">
                <span className="security-label danger-text">Cerrar sesión</span>
                <span className="security-sub">Salir de la cuenta en este dispositivo</span>
              </div>
            </div>
          </div>

          {/* Mis proyectos */}
          {workspaces.length > 0 && (
            <div className="form-card">
              <h3 className="form-card-title">Mis proyectos</h3>
              <p className="form-card-sub">Espacios de trabajo en los que participas</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {workspaces.map((ws, i) => (
                  <div key={ws.id} className="profile-ws-row">
                    <div
                      className="profile-ws-dot"
                      style={{ background: colorMap[i % 5] }}
                    />
                    <div>
                      <p className="profile-ws-name">{ws.project_name}</p>
                      <p className="profile-ws-meta">
                        {ws.role === 'OWNER' ? 'Admin' : 'Miembro'} · {ws.stats.total_tasks} tareas
                      </p>
                    </div>
                    {ws.role === 'OWNER' && (
                      <span className="role-badge owner" style={{ marginLeft: 'auto' }}>
                        Admin
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modales */}
      {showSaved && (
        <ChangesSavedModal onContinue={() => setShowSaved(false)} />
      )}
      {showDelete && (
        <DeleteAccountModal
          onCancel={() => setShowDelete(false)}
          onConfirm={() => {
            setShowDelete(false)
            logout()
          }}
        />
      )}
    </>
  )
}