import { createProjectCoverSignedUrl } from "@/features/projects/repositories/project-covers.repository";
import type { SharedProjectSummary } from "@/features/projects/types/project.types";
import {
  requireSupabase,
  toRepositoryError
} from "@/infrastructure/supabase/repository";
import type { PaginatedResult } from "@/shared/utils/pagination";

export async function listSharedProjectRows({
  offset,
  pageSize
}: {
  offset: number;
  pageSize: number;
}): Promise<PaginatedResult<SharedProjectSummary>> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("list_shared_projects", {
    p_limit: pageSize,
    p_offset: offset
  });

  if (error) {
    throw toRepositoryError(error);
  }

  const page = data as {
    has_more: boolean;
    items: SharedProjectSummary[];
    next_offset: number | null;
  };
  const items = await Promise.all(
    page.items.map(async (project) => ({
      ...project,
      cover_image_url: project.cover_image_path
        ? await createProjectCoverSignedUrl(project.cover_image_path)
        : null
    }))
  );

  return {
    items,
    nextOffset: page.next_offset
  };
}
