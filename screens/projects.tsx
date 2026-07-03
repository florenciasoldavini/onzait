import {
  AppButton,
  AppCard,
  AppHeading,
  AppText,
  EmptyState,
  Screen,
  SelectField,
  TextField
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectCardSkeleton } from "@/features/projects/components/project-card-skeleton";
import {
  PROJECT_PHASE_LABELS,
  PROJECT_PHASES,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES
} from "@/features/projects/constants";
import { useProjects, useSoftDeleteProject } from "@/features/projects/hooks";
import type { ProjectFilters } from "@/features/projects/types";
import { useRouter } from "expo-router";
import { FolderPlus, RefreshCw, Search } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

export default function ProjectsScreen() {
  const router = useRouter();
  const [filters, setFilters] = useState<ProjectFilters>({
    phase: "all",
    query: "",
    status: "all"
  });
  const projectsQuery = useProjects(filters);
  const deleteMutation = useSoftDeleteProject();

  const updateFilter = <K extends keyof ProjectFilters>(
    key: K,
    value: ProjectFilters[K]
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[3] }}>
          <AppText variant="eyebrow">Projects / Workspace</AppText>
          <AppHeading variant="hero">Track job sites by project.</AppHeading>
          <AppText tone="muted">
            Manage project location, status, phase, and cover context before
            tasks and field updates arrive.
          </AppText>
          <AppButton
            fullWidth={false}
            icon={FolderPlus}
            iconAfter={false}
            onPress={() => router.push("/projects/new" as never)}
            size="sm"
          >
            New Project
          </AppButton>
        </View>

        <AppCard padding="lg" tone="muted">
          <View style={{ gap: atomSpacing[4] }}>
            <TextField
              leftIcon={Search}
              onChangeText={(text) => updateFilter("query", text)}
              placeholder="Search projects"
              value={filters.query ?? ""}
              label="Search"
            />
            <SelectField
              label="Status"
              onChange={(status) => updateFilter("status", status)}
              options={[
                { label: "All", value: "all" },
                ...PROJECT_STATUSES.map((value) => ({
                  label: PROJECT_STATUS_LABELS[value],
                  value
                }))
              ]}
              value={filters.status ?? "all"}
            />
            <SelectField
              label="Phase"
              onChange={(phase) => updateFilter("phase", phase)}
              options={[
                { label: "All", value: "all" },
                ...PROJECT_PHASES.map((value) => ({
                  label: PROJECT_PHASE_LABELS[value],
                  value
                }))
              ]}
              value={filters.phase ?? "all"}
            />
          </View>
        </AppCard>

        {projectsQuery.isLoading ? (
          <View style={{ gap: atomSpacing[4] }}>
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </View>
        ) : projectsQuery.isError ? (
          <EmptyState
            action={{
              icon: RefreshCw,
              label: "Retry",
              onPress: () => {
                void projectsQuery.refetch();
              }
            }}
            description={
              projectsQuery.error instanceof Error
                ? projectsQuery.error.message
                : "Projects could not be loaded."
            }
            title="Projects unavailable"
          />
        ) : projectsQuery.data && projectsQuery.data.length > 0 ? (
          <View style={{ gap: atomSpacing[4] }}>
            {projectsQuery.data.map((project) => (
              <View key={project.id} style={{ gap: atomSpacing[2] }}>
                <ProjectCard
                  isDeleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === project.id
                  }
                  onPress={() =>
                    router.push(`/projects/${project.id}` as never)
                  }
                  project={project}
                />
                <AppButton
                  isDisabled={deleteMutation.isPending}
                  loading={
                    deleteMutation.isPending &&
                    deleteMutation.variables === project.id
                  }
                  onPress={() => {
                    void deleteMutation.mutateAsync(project.id);
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Archive project
                </AppButton>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            action={{
              icon: FolderPlus,
              label: "New Project",
              onPress: () => router.push("/projects/new" as never)
            }}
            description="Create your first project to start organizing job-site work."
            icon={FolderPlus}
            title="No projects yet"
          />
        )}
      </View>
    </Screen>
  );
}
