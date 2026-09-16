import { listSharedProjectRows } from "@/features/projects/repositories/shared-projects.repository";
import type { SharedProjectSummary } from "@/features/projects/types/project.types";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult
} from "@/shared/utils/pagination";
import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export const sharedProjectsKey = ["shared-projects"] as const;

export function useSharedProjects() {
  return useInfiniteQuery<
    PaginatedResult<SharedProjectSummary>,
    Error,
    InfiniteData<PaginatedResult<SharedProjectSummary>>,
    typeof sharedProjectsKey,
    number
  >({
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listSharedProjectRows({ offset: pageParam, pageSize: DEFAULT_PAGE_SIZE }),
    queryKey: sharedProjectsKey
  });
}
