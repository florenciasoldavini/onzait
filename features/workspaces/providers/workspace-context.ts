import type { WorkspaceSummary } from "@/features/workspaces/types/workspace";
import { createContext } from "react";

export interface WorkspaceContextValue {
  activeWorkspace: WorkspaceSummary | null;
  activeWorkspaceId: string | null;
  hasWorkspaces: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => Promise<void>;
  workspaces: WorkspaceSummary[];
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null
);
