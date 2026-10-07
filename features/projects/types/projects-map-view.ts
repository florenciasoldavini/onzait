import type { ProjectSummary } from "@/features/projects/types/project.types";

export type ProjectsMapViewProps = {
  showMapWhenEmpty?: boolean;
  edgeToEdge?: boolean;
  fillAvailableSpace?: boolean;
  highlightedProjectId?: string | null;
  onOpenProject: (project: ProjectSummary) => void;
  onSelectProject?: (projectId: string | null) => void;
  projects: ProjectSummary[];
  selectedProjectId?: string | null;
};
