import { ProjectsMapView } from "@/features/projects/components/projects-map-lazy";
import { ProjectSplitRow } from "@/features/projects/components/project-split-row";
import { projectsSplitStyles as styles } from "@/features/projects/components/projects-split-view.styles";
import type { ProjectSummary } from "@/features/projects/types/project.types";
import { ProjectCardSkeleton } from "@/features/projects/components/project-card-skeleton";
import { AppText } from "@/shared/ui/components/text";
import { Suspense, useCallback, useState, type ReactElement } from "react";
import { FlatList, View, type ListRenderItemInfo } from "react-native";
import { useTranslation } from "react-i18next";

export function ProjectsSplitView({
  emptyContent,
  floatingAction,
  sidebarHeader,
  viewSwitcher,
  onOpenProject,
  paginationFooter,
  projects
}: {
  emptyContent: ReactElement;
  floatingAction: ReactElement;
  sidebarHeader: ReactElement;
  viewSwitcher: ReactElement;
  onOpenProject: (projectId: string) => void;
  paginationFooter: ReactElement;
  projects: ProjectSummary[];
}) {
  const { t } = useTranslation("features/projects");
  const [selection, setSelection] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const selectedProjectId = projects.some((project) => project.id === selection)
    ? selection
    : null;
  const renderProject = useCallback(
    ({ item }: ListRenderItemInfo<ProjectSummary>) => (
      <ProjectSplitRow
        onHighlight={setHoveredProjectId}
        onOpenProject={onOpenProject}
        onSelect={setSelection}
        project={item}
        selected={item.id === selectedProjectId}
      />
    ),
    [onOpenProject, selectedProjectId]
  );

  return (
    <View style={styles.root}>
      <View style={styles.listPane}>
        {sidebarHeader}
        <View style={styles.listHeader}>
          <AppText variant="label">
            {t(($) => $["features/projects"].gallery.loadedProjects)}
          </AppText>
          <AppText tone="muted" variant="label">
            {projects.length}
          </AppText>
        </View>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={projects}
          extraData={selectedProjectId}
          initialNumToRender={12}
          keyExtractor={(project) => project.id}
          ListEmptyComponent={
            <View style={styles.emptyContent}>{emptyContent}</View>
          }
          ListFooterComponent={projects.length > 0 ? paginationFooter : null}
          renderItem={renderProject}
          style={styles.list}
        />
        <View pointerEvents="box-none" style={styles.floatingAction}>
          {floatingAction}
        </View>
      </View>
      <View style={styles.mapPane}>
        <Suspense fallback={<ProjectCardSkeleton />}>
          <ProjectsMapView
            showMapWhenEmpty
            edgeToEdge
            fillAvailableSpace
            highlightedProjectId={hoveredProjectId}
            onOpenProject={(project) => onOpenProject(project.id)}
            onSelectProject={setSelection}
            projects={projects}
            selectedProjectId={selectedProjectId}
          />
        </Suspense>
        <View style={styles.viewSwitcher}>{viewSwitcher}</View>
      </View>
    </View>
  );
}
