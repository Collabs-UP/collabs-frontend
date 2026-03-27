import api from '@/lib/api'
import type {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  JoinWorkspaceDto,
  WorkspaceRole,
} from '@/types'

interface CreateWorkspaceResponse {
  id: string;
  projectName: string;
  description: string;
  accessCode: string;
  role: WorkspaceRole
  createdAt: string;
}

interface JoinWorkspaceResponse {
  message: string;
  workspace: {
    id: string;
    projectName: string;
    description: string;
    accessCode: string;
  };
  membership: {
    id: string;
    role: WorkspaceRole;
    joinedAt: string;
  };
}

export const WorkspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const res = await api.get<{ data: any[] }>('/workspaces');
    
    return res.data.data.map((ws) => ({
      id: ws.id,
      projectName: ws.project_name || ws.projectName,
      description: ws.description,
      accessCode: ws.access_code || ws.accessCode,
      role: ws.role,
      createdAt: ws.created_at || ws.createdAt,
      owner: ws.owner,
      stats: ws.stats
    })) as Workspace[];
  },

  create: async (data: CreateWorkspaceDto): Promise<Workspace> => {
    const res = await api.post('/workspaces', data);
    
    const newWS = (res.data as any).data || res.data;

    return {
      id: newWS.id,
      projectName: newWS.projectName || newWS.project_name,
      description: newWS.description,
      accessCode: newWS.accessCode || newWS.access_code,
      role: newWS.role || 'OWNER',
      createdAt: newWS.createdAt || newWS.created_at || new Date().toISOString(),
      
      owner: newWS.owner || { id: '', name: 'Tú', email: '' },
      stats: newWS.stats || {
        total_tasks: 0,
        completed_tasks: 0,
        in_process_tasks: 0,
        progress_percentage: 0 
      }
    } as Workspace;
  },

  update: async (id: string, data: UpdateWorkspaceDto): Promise<Workspace> => {
    const res = await api.patch<Workspace>(`/workspaces/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`)
  },

  join: async (data: JoinWorkspaceDto): Promise<Workspace> => {
    const res = await api.post<JoinWorkspaceResponse>('/workspaces/join', data);
    
    const ws = res.data.workspace;
    const membership = res.data.membership;
    
    return {
      id: ws.id,
      projectName: ws.projectName,
      description: ws.description,
      accessCode: ws.accessCode,
      role: membership.role, 
      createdAt: new Date().toISOString(), // El join no devuelve fecha de creación, usa una por defecto
      
      owner: { id: '', name: 'Admin', email: '' },
      stats: {
        total_tasks: 0,
        completed_tasks: 0,
        in_process_tasks: 0,
        progress_percentage: 0
      }
    } as Workspace;
  }
}