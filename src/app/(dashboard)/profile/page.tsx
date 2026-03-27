'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useWorkspace } from '@/context/WorkspaceContext'
import ChangesSavedModal from '@/components/modals/ChangesSavedModal'
import DeleteAccountModal from '@/components/modals/DeleteAccountModal'
import { UserService } from '@/services/user.service' 
import axios from 'axios'

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const { workspaces } = useWorkspace()
  
  const [showSaved, setShowSaved] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })
  const [saving, setSaving] = useState(false)

  // Sincroniza el formulario cuando los datos del usuario cargan desde el AuthContext
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
      })
    }
  }, [user])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  // Cálculo de estadísticas basado en los workspaces del contexto
  const completedTasks = workspaces.reduce((a, ws) => a + (ws.stats?.completed_tasks || 0), 0)
  const inProcessTasks = workspaces.reduce((a, ws) => a + (ws.stats?.in_process_tasks || 0), 0)
  const adminCount = workspaces.filter((ws) => ws.role === 'OWNER').length

  const handleSave = async () => {
    if (!form.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    setSaving(true)
    try {
      // Enviamos solo el nombre según el DTO del backend
      const updatedUser = await UserService.updateProfile({ name: form.name });
      
      // Actualizamos el contexto global para reflejar el cambio en Sidebar/Navbar
      if (setUser && user) {
        setUser({ ...user, name: updatedUser.name });
      }
      
      setShowSaved(true)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        const msg = error.response.data.message;
        alert(Array.isArray(msg) ? msg[0] : msg);
      } else {
        alert('Ocurrió un error al guardar los cambios.');
      }
    } finally {
      setSaving(false)
    }
  }

  const colorMap: Record<number, string> = {
    0: '#6355E8', 1: '#0D9488', 2: '#D97706', 3: '#E11D48', 4: '#3B82F6',
  }

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-date">Gestiona tu información personal y seguridad</p>
        </div>
      </header>

      <div className="profile-content">
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
            <p className="profile-name">{user?.name ?? 'Cargando...'}</p>
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

        <div className="profile-right">
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
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#f5f5f7' }}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>
            
            <div className="form-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-cancel-sm"
                  onClick={() => setForm({ name: user?.name ?? '', email: user?.email ?? '' })}
                >
                  Cancelar
                </button>
                <button className="btn-save" onClick={handleSave} disabled={saving} style={{ background: '#6355E8', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
              
              <button className="btn-delete-account" onClick={() => setShowDelete(true)} style={{ color: '#E11D48', background: '#E11D4810', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                Eliminar cuenta
              </button>
            </div>
          </div>

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
              <button className="btn-cancel-sm" onClick={logout} style={{ color: '#E11D48', borderColor: '#E11D4830' }}>
                Cerrar sesión
              </button>
            </div>
          </div>

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
                      <p className="profile-ws-name">{ws.projectName}</p>
                      <p className="profile-ws-meta">
                        {ws.role === 'OWNER' ? 'Admin' : 'Miembro'} · {ws.stats?.total_tasks || 0} tareas
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

      {showSaved && (
        <ChangesSavedModal onContinue={() => setShowSaved(false)} />
      )}
      {showDelete && (
        <DeleteAccountModal
          onCancel={() => setShowDelete(false)}
          onConfirm={async () => {
            try {
                await UserService.deleteAccount();
                logout();
            } catch (err: any) {
                alert(err.response?.data?.message || 'No se pudo eliminar la cuenta');
                setShowDelete(false);
            }
          }}
        />
      )}
    </>
  )
}