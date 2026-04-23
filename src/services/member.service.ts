import api from '@/lib/api'
import type { WorkspaceMembersResponse } from '@/types'

export const MemberService = {
  getByWorkspace: async (
    workspaceId: string
  ): Promise<WorkspaceMembersResponse> => {
    const res = await api.get<WorkspaceMembersResponse>(
      `/workspaces/${workspaceId}/members`
    )
    return res.data
  },
  remove: async (workspaceId: string, memberId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
    return res.data
  }
}