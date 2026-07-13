import {
  createProjectCoverSignedUrl,
  uploadProjectCoverObject
} from "@/features/projects/repositories/project-covers.repository";
import {
  getProjectRow,
  insertProjectRow,
  listProjectRows,
  softDeleteProjectRow,
  updateProjectRow
} from "@/features/projects/repositories/projects.repository";
import type {
  CreateProjectInput,
  Project,
  ProjectFilters,
  UpdateProjectInput
} from "@/features/projects/types";

export async function listProjects({
  filters,
  userId,
  userRole
}: {
  filters?: ProjectFilters;
  userId: string;
  userRole: "admin" | "user";
}) {
  const projects = await listProjectRows({ filters, userId, userRole });
  return addCoverUrls(projects);
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
  const coverPath = await uploadProjectCoverObject({ asset, projectId });
  await updateProjectRow(projectId, { cover_image_path: coverPath });
  return coverPath;
}

async function addCoverUrls(projects: Project[]) {
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
