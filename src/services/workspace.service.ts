import api from '@/lib/api'
import type {
  Workspace,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  JoinWorkspaceDto,
} from '@/types'

export const WorkspaceService = {
  getAll: async (): Promise<Workspace[]> => {
    const res = await api.get<{ data: Workspace[] }>('/workspaces')
    return res.data.data
  },

  create: async (data: CreateWorkspaceDto): Promise<Workspace> => {
    const res = await api.post<Workspace>('/workspaces', data)
    return res.data
  },

  update: async (id: string, data: UpdateWorkspaceDto): Promise<Workspace> => {
    const res = await api.put<Workspace>(`/workspaces/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`)
  },

  join: async (data: JoinWorkspaceDto): Promise<Workspace> => {
    const res = await api.post<Workspace>('/workspaces/join', data)
    return res.data
  },
}