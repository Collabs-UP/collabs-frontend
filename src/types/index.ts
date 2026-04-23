// ── AUTH

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

// ── USER
export interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null; 
  login: (token: string) => void;
  logout: () => void;
  
  setUser: (user: User) => void; 
}

// ── WORKSPACE
export type WorkspaceRole = 'OWNER' | 'MEMBER'

export interface Workspace {
  id: string
  projectName: string
  description: string
  accessCode: string
  role: WorkspaceRole
  createdAt: string
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
  projectName: string;
  description: string;
}

export interface UpdateWorkspaceDto {
  project_name: string
  description: string
}

export interface JoinWorkspaceDto {
  accessCode: string
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
  assignedToId: string
  dueDate: string
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