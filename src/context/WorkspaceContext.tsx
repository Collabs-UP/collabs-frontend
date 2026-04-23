'use client'

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import type { Workspace } from '@/types'

interface WorkspaceContextType {
  activeWorkspace: Workspace | null
  setActiveWorkspace: (workspace: Workspace | null) => void
  workspaces: Workspace[]
  setWorkspaces: (workspaces: Workspace[]) => void
  showNewWorkspace: boolean
  setShowNewWorkspace: (v: boolean) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [showNewWorkspace, setShowNewWorkspace] = useState(false)

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        setActiveWorkspace,
        workspaces,
        setWorkspaces,
        showNewWorkspace,
        setShowNewWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx)
    throw new Error('useWorkspace debe usarse dentro de WorkspaceProvider')
  return ctx
}