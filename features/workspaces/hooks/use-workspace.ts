import { WorkspaceContext } from "@/features/workspaces/providers/workspace-context";
import { useContext } from "react";

export function useWorkspace() {
  const value = useContext(WorkspaceContext);

  if (!value) {
    throw new Error("useWorkspace must be used within WorkspaceProvider.");
  }

  return value;
}
