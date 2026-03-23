// ── AUTH

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// ── USER

export interface User {
  id: string
  name: string
  email: string
}

// ── WORKSPACE

export type WorkspaceRole = 'OWNER' | 'MEMBER'

export interface Workspace {
  id: string
  project_name: string
  description: string
  access_code: string
  role: WorkspaceRole
  created_at: string
  owner: User
  stats: WorkspaceStats
}

export interface WorkspaceStats {
  total_tasks: number
  completed_tasks: number
  in_process_tasks: number
  progress_percentage: number
}

export interface CreateWorkspaceDto {
  project_name: string
  description: string
}

export interface UpdateWorkspaceDto {
  project_name: string
  description: string
}

export interface JoinWorkspaceDto {
  access_code: string
}

// ── MEMBER

export interface Member {
  id: string
  name: string
  email: string
  role: WorkspaceRole
  joined_at: string
  task_stats: MemberTaskStats
}

export interface MemberTaskStats {
  assigned_tasks: number
  completed_tasks: number
  in_process_tasks: number
}

// ── TASK

export type TaskStatus = 'IN_PROCESS' | 'COMPLETED'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  created_at: string
  due_date: string
  assigned_to: User
}

export interface TaskSummary {
  total_tasks: number
  completed_tasks: number
  in_process_tasks: number
  progress_percentage: number
}

export interface CreateTaskDto {
  title: string
  description: string
  assigned_to_id: string
  due_date: string
}

export interface UpdateTaskStatusDto {
  status: TaskStatus
}

// ── API RESPONSES

export interface ApiError {
  message: string
  statusCode: number
}

export interface WorkspaceWithTasks extends Workspace {
  tasks: Task[]
  summary: TaskSummary
}

export interface WorkspaceMembersResponse {
  workspace_id: string
  members: Member[]
}