import api from '@/lib/api'
import type {
  Task,
  TaskSummary,
  CreateTaskDto,
  UpdateTaskStatusDto,
} from '@/types'

interface GetTasksResponse {
  workspace_id: string
  tasks: Task[]
  summary: TaskSummary
}

export const TaskService = {
  getByWorkspace: async (workspaceId: string): Promise<GetTasksResponse> => {
    const res = await api.get<GetTasksResponse>(
      `/workspaces/${workspaceId}/tasks`
    )
    return res.data
  },

  create: async (workspaceId: string, data: CreateTaskDto): Promise<Task> => {
    const res = await api.post<Task>(
      `/workspaces/${workspaceId}/tasks`,
      data
    )
    return res.data
  },

  updateStatus: async (
    taskId: string,
    data: UpdateTaskStatusDto
  ): Promise<Task> => {
    const res = await api.patch<Task>(`/tasks/${taskId}/status`, data)
    return res.data
  },

  remove: async (workspaceId: string, taskId: string) => {
    const res = await api.delete(`/workspaces/${workspaceId}/tasks/${taskId}`);
    return res.data;
  }
}