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
}