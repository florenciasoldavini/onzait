import {
  createProjectCoverSignedUrl,
  removeProjectCoverObject,
  uploadProjectCoverObject
} from "@/features/projects/repositories/project-covers.repository";
import {
  getProjectRow,
  insertProjectRow,
  listProjectRows,
  replaceProjectCoverPath,
  softDeleteProjectRow,
  updateProjectRow
} from "@/features/projects/repositories/projects.repository";
import type {
  CreateProjectInput,
  Project,
  ProjectFilters,
  ProjectSummary,
  UpdateProjectInput
} from "@/features/projects/types";
import type { OffsetPageRequest, PaginatedResult } from "@/lib/pagination";
import { Sentry } from "@/lib/sentry";

export async function listProjects({
  filters,
  offset,
  pageSize,
  userId,
  userRole
}: {
  filters?: ProjectFilters;
  userId: string;
  userRole: "admin" | "user";
} & OffsetPageRequest): Promise<PaginatedResult<ProjectSummary>> {
  const page = await listProjectRows({
    filters,
    offset,
    pageSize,
    userId,
    userRole
  });

  return {
    ...page,
    items: await addCoverUrls<ProjectSummary>(page.items)
  };
}

export async function getProject(projectId: string) {
  const project = await getProjectRow(projectId);

  if (!project) {
    return null;
  }

  const [projectWithCover] = await addCoverUrls([project]);
  return projectWithCover;
}

export async function createProject(input: CreateProjectInput) {
  return insertProjectRow(input);
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
) {
  return updateProjectRow(projectId, input);
}

export async function softDeleteProject(projectId: string) {
  return softDeleteProjectRow(projectId);
}

export async function uploadProjectCover({
  asset,
  projectId
}: {
  asset: { fileName?: string | null; mimeType?: string | null; uri: string };
  projectId: string;
}) {
  const project = await getProjectRow(projectId);

  if (!project) {
    throw new Error("Project not found.");
  }

  const coverPath = await uploadProjectCoverObject({ asset, projectId });

  try {
    await replaceProjectCoverPath({
      expectedCurrentPath: project.cover_image_path,
      newPath: coverPath,
      projectId
    });
  } catch (error) {
    await removeProjectCoverSafely({
      cleanupReason: "compensation",
      path: coverPath,
      projectId
    });
    throw error;
  }

  if (project.cover_image_path && project.cover_image_path !== coverPath) {
    await removeProjectCoverSafely({
      cleanupReason: "replacement",
      path: project.cover_image_path,
      projectId
    });
  }

  return coverPath;
}

async function removeProjectCoverSafely({
  cleanupReason,
  path,
  projectId
}: {
  cleanupReason: "compensation" | "replacement";
  path: string;
  projectId: string;
}) {
  try {
    await removeProjectCoverObject({ path, projectId });
  } catch (cleanupError) {
    Sentry.captureException(cleanupError, {
      tags: {
        storage_cleanup: `project-cover-${cleanupReason}`
      }
    });
  }
}

async function addCoverUrls<TProject extends Pick<Project, "cover_image_path">>(
  projects: TProject[]
) {
  return Promise.all(
    projects.map(async (project) => {
      if (!project.cover_image_path) {
        return { ...project, cover_image_url: null };
      }

      return {
        ...project,
        cover_image_url: await createProjectCoverSignedUrl(
          project.cover_image_path
        )
      };
    })
  );
}
