import { AuthContext } from "@/contexts/auth";
import {
  autocompleteProjectAddress,
  getProjectAddressMapPreview,
  getProjectsMapPreview,
  resolveProjectAddress
} from "@/features/projects/services/address.service";
import {
  createProject,
  getProject,
  listProjects,
  softDeleteProject,
  updateProject,
  uploadProjectCover
} from "@/features/projects/services/projects.service";
import type {
  CreateProjectInput,
  ProjectFilters,
  ProjectSummary,
  StaticMapPoint,
  StaticMapViewport,
  UpdateProjectInput
} from "@/features/projects/types";
import { normalizeProjectFilters } from "@/features/projects/validation";
import {
  DEFAULT_PAGE_SIZE,
  type PaginatedResult
} from "@/lib/pagination";
import { UserFacingError } from "@/lib/user-facing-errors";
import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";

const projectsKey = ["projects"] as const;

export function useProjects(filters: ProjectFilters) {
  const { user } = useContext(AuthContext);
  const debouncedQuery = useDebouncedValue(filters.query ?? "", 350);
  const requestFilters = useMemo(
    () => ({ ...filters, query: debouncedQuery }),
    [debouncedQuery, filters]
  );
  const normalizedFilters = useMemo(
    () => normalizeProjectFilters(requestFilters),
    [requestFilters]
  );

  return useInfiniteQuery<
    PaginatedResult<ProjectSummary>,
    Error,
    InfiniteData<PaginatedResult<ProjectSummary>>,
    readonly unknown[],
    number
  >({
    enabled: Boolean(user),
    getNextPageParam: (lastPage) => lastPage.nextOffset ?? undefined,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listProjects({
        filters: requestFilters,
        offset: pageParam,
        pageSize: DEFAULT_PAGE_SIZE,
        userId: user!.id,
        userRole: user!.role
      }),
    queryKey: [...projectsKey, user?.id, user?.role, normalizedFilters]
  });
}

export function useProject(projectId?: string) {
  return useQuery({
    enabled: Boolean(projectId),
    queryFn: () => getProject(projectId!),
    queryKey: [...projectsKey, "detail", projectId]
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { createUser, session, user } = useContext(AuthContext);

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      if (!session) {
        throw new UserFacingError("You must be signed in to save projects.");
      }

      const currentUser = user ?? (await createUser(session));

      if (!currentUser) {
        throw new UserFacingError(
          "We could not finish setting up your account. Sign out and back in, then try again."
        );
      }

      return createProject(input);
    },
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: projectsKey });
      queryClient.setQueryData([...projectsKey, "detail", project.id], project);
    }
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(projectId, input),
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: projectsKey });
      queryClient.setQueryData([...projectsKey, "detail", project.id], project);
    }
  });
}

export function useSoftDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => softDeleteProject(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectsKey });
    }
  });
}

export function useUploadProjectCover(defaultProjectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      asset,
      projectId
    }: {
      asset: {
        fileName?: string | null;
        mimeType?: string | null;
        uri: string;
      };
      projectId?: string;
    }) => {
      const resolvedProjectId = projectId ?? defaultProjectId;

      if (!resolvedProjectId) {
        throw new UserFacingError(
          "We couldn't identify the project for this cover. Return to the project and try again."
        );
      }

      return uploadProjectCover({ asset, projectId: resolvedProjectId });
    },
    onSuccess: async (_path, variables) => {
      const resolvedProjectId = variables.projectId ?? defaultProjectId;

      await queryClient.invalidateQueries({ queryKey: projectsKey });

      if (resolvedProjectId) {
        await queryClient.invalidateQueries({
          queryKey: [...projectsKey, "detail", resolvedProjectId]
        });
      }
    }
  });
}

export function useAddressAutocomplete(
  input: string,
  sessionToken: string,
  enabled = true
) {
  const debouncedInput = useDebouncedValue(input, 350);

  return useQuery({
    enabled:
      enabled && debouncedInput.trim().length >= 3 && sessionToken.length > 0,
    queryFn: () =>
      autocompleteProjectAddress({
        input: debouncedInput.trim(),
        sessionToken
      }),
    queryKey: ["address-autocomplete", debouncedInput.trim(), sessionToken],
    staleTime: 30_000
  });
}

export function useResolveAddress() {
  return useMutation({
    mutationFn: ({
      placeId,
      sessionToken
    }: {
      placeId: string;
      sessionToken: string;
    }) => resolveProjectAddress({ placeId, sessionToken })
  });
}

export function useAddressMapPreview({
  latitude,
  longitude
}: {
  latitude?: number;
  longitude?: number;
}) {
  return useQuery({
    enabled: typeof latitude === "number" && typeof longitude === "number",
    queryFn: () =>
      getProjectAddressMapPreview({
        latitude: latitude!,
        longitude: longitude!
      }),
    queryKey: ["address-map-preview", latitude, longitude],
    retry: 1,
    staleTime: 30 * 60_000
  });
}

export function useProjectsMapPreview({
  points,
  viewport
}: {
  points: StaticMapPoint[];
  viewport?: StaticMapViewport | null;
}) {
  const queryPoints = useMemo(
    () =>
      points.map((point) => ({
        label: point.label ?? "",
        latitude: point.latitude,
        longitude: point.longitude
      })),
    [points]
  );
  const queryViewport = useMemo(
    () =>
      viewport
        ? {
            centerLatitude: viewport.centerLatitude,
            centerLongitude: viewport.centerLongitude,
            zoom: viewport.zoom
          }
        : null,
    [viewport]
  );

  return useQuery({
    enabled: queryPoints.length > 0,
    queryFn: () =>
      getProjectsMapPreview({ points: queryPoints, viewport: queryViewport }),
    queryKey: ["projects-map-preview", queryPoints, queryViewport],
    retry: 1,
    staleTime: 30 * 60_000
  });
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [delayMs, value]);

  return debouncedValue;
}
