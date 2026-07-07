import {
  AppButton,
  Breadcrumb,
  AppHeading,
  EmptyState,
  Screen,
  TextField
} from "@/components/atoms";
import { atomMotion } from "@/components/atoms/motion";
import { atomLayout, atomSpacing } from "@/components/atoms/theme";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectCardSkeleton } from "@/features/projects/components/project-card-skeleton";
import { useProjects } from "@/features/projects/hooks";
import { useRouter } from "expo-router";
import { FolderPlus, RefreshCw, Search } from "lucide-react-native";
import { useState } from "react";
import { useWindowDimensions, View, type ViewStyle } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";

export default function ProjectsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const projectsQuery = useProjects({
    phase: "all",
    query,
    status: "all"
  });
  const hasProjects = Boolean(projectsQuery.data?.length);
  const projectGrid = getProjectGridMetrics(width);

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
          <Breadcrumb items={[{ label: "Projects" }, { label: "Workspace" }]} />
          <AppHeading variant="hero">Projects</AppHeading>
        </View>

        <TextField
          leftIcon={Search}
          onChangeText={setQuery}
          placeholder="Search projects"
          value={query}
        />

        {projectsQuery.isLoading ? (
          <View style={projectGrid.containerStyle}>
            {[0, 1, 2, 3].map((item) => (
              <View key={item} style={projectGrid.itemStyle}>
                <ProjectCardSkeleton />
              </View>
            ))}
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
          <View style={projectGrid.containerStyle}>
            {projectsQuery.data.map((project, index) => (
              <Animated.View
                entering={FadeIn.duration(atomMotion.duration.enter).delay(
                  Math.min(index, 6) * 36
                )}
                exiting={FadeOut.duration(atomMotion.duration.exit)}
                key={project.id}
                layout={LinearTransition.duration(atomMotion.duration.layout)}
                style={projectGrid.itemStyle}
              >
                <ProjectCard
                  onPress={() =>
                    router.push(`/projects/${project.id}` as never)
                  }
                  project={project}
                />
              </Animated.View>
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

function getProjectGridMetrics(screenWidth: number) {
  const horizontalPadding =
    screenWidth >= atomLayout.breakpointDesktop
      ? atomLayout.marginDesktop
      : screenWidth >= atomLayout.breakpointTablet
        ? atomLayout.marginTablet
        : atomLayout.marginMobile;
  const availableWidth = Math.max(
    0,
    Math.min(screenWidth, atomLayout.maxWidthContent) - horizontalPadding * 2
  );
  const gap = atomSpacing[4];
  const columns =
    availableWidth >= 1080
      ? 4
      : availableWidth >= 900
      ? 3
      : availableWidth >= atomLayout.breakpointTablet
        ? 2
        : 1;
  const itemWidth =
    columns === 1
      ? ("100%" as const)
      : (availableWidth - gap * (columns - 1)) / columns;

  return {
    containerStyle: {
      alignItems: "stretch" as const,
      flexDirection: columns === 1 ? ("column" as const) : ("row" as const),
      flexWrap: "wrap" as const,
      gap
    } satisfies ViewStyle,
    itemStyle: {
      flexGrow: 0,
      flexShrink: 0,
      width: itemWidth
    } satisfies ViewStyle
  };
}
