import {
  AppButton,
  AppHeading,
  AppText,
  EmptyState,
  Screen,
  TextField
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectCardSkeleton } from "@/features/projects/components/project-card-skeleton";
import { useProjects, useSoftDeleteProject } from "@/features/projects/hooks";
import { useRouter } from "expo-router";
import { FolderPlus, RefreshCw, Search } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";

export default function ProjectsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const projectsQuery = useProjects({
    phase: "all",
    query,
    status: "all"
  });
  const deleteMutation = useSoftDeleteProject();
  const hasProjects = Boolean(projectsQuery.data?.length);

  return (
    <Screen
      floatingAction={
        hasProjects ? (
          <AppButton
            accessibilityLabel="New project"
            icon={FolderPlus}
            layout="icon"
            onPress={() => router.push("/projects/new" as never)}
            shape="pill"
            size="iconLg"
          />
        ) : null
      }
    >
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[3] }}>
          <AppText variant="eyebrow">Projects / Workspace</AppText>
          <AppHeading variant="hero">Projects</AppHeading>
        </View>

        <TextField
          leftIcon={Search}
          onChangeText={setQuery}
          placeholder="Search projects"
          value={query}
        />

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
                  color="warning"
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
