import { useAuth } from "@/features/auth/hooks/use-auth";
import { getWorkspaceProjectCount } from "@/features/projects/services/projects.service";
import { useQuery } from "@tanstack/react-query";

export function useWorkspaceProjectCount(workspaceId: string) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["projects", "workspace-count", workspaceId, session?.user.id],
    queryFn: () => getWorkspaceProjectCount(workspaceId),
    enabled: Boolean(session && workspaceId),
    staleTime: 30_000
  });
}
