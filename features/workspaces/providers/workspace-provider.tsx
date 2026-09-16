import { useAuth } from "@/features/auth/hooks/use-auth";
import { WorkspaceContext } from "@/features/workspaces/providers/workspace-context";
import {
  getPreferredWorkspaceId,
  listMyWorkspaces,
  savePreferredWorkspaceId
} from "@/features/workspaces/services/workspaces.service";
import type { WorkspaceSummary } from "@/features/workspaces/types/workspace";
import { queryClient } from "@/infrastructure/query/client";
import { Sentry } from "@/infrastructure/monitoring/sentry";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { session, user } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(Boolean(session));

  const refresh = useCallback(async () => {
    if (!session || !user) {
      setWorkspaces([]);
      setActiveWorkspaceId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [page, preferredId] = await Promise.all([
        listMyWorkspaces(),
        getPreferredWorkspaceId()
      ]);
      const selected = page.items.some((item) => item.id === preferredId)
        ? preferredId
        : (page.items[0]?.id ?? null);

      setWorkspaces(page.items);
      setActiveWorkspaceId(selected);
      await savePreferredWorkspaceId(selected);
    } catch (error) {
      Sentry.captureException(error);
      setWorkspaces([]);
      setActiveWorkspaceId(null);
    } finally {
      setIsLoading(false);
    }
  }, [session, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!workspaces.some((workspace) => workspace.id === workspaceId)) {
        return;
      }
      setActiveWorkspaceId(workspaceId);
      await savePreferredWorkspaceId(workspaceId);
      await queryClient.invalidateQueries();
    },
    [workspaces]
  );

  const activeWorkspace = useMemo(
    () =>
      workspaces.find((workspace) => workspace.id === activeWorkspaceId) ??
      null,
    [activeWorkspaceId, workspaces]
  );
  const value = useMemo(
    () => ({
      activeWorkspace,
      activeWorkspaceId,
      hasWorkspaces: workspaces.length > 0,
      isLoading,
      refresh,
      selectWorkspace,
      workspaces
    }),
    [
      activeWorkspace,
      activeWorkspaceId,
      isLoading,
      refresh,
      selectWorkspace,
      workspaces
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
