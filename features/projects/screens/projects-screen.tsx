import { ProjectsMapView } from "@/features/projects/components/projects-map-lazy";
import { ProjectsSplitView } from "@/features/projects/components/projects-split-view";
import { AppButton } from "@/shared/ui/components/button";
import { EmptyState } from "@/shared/ui/components/empty-state";
import { InlineErrorState } from "@/shared/ui/components/inline-error-state";
import { SearchField } from "@/shared/ui/components/input";
import { NavScreenHeader } from "@/shared/ui/components/nav-screen-header";
import { Screen } from "@/shared/ui/components/screen";
import { SelectMenu } from "@/shared/ui/components/select-menu";
import { SegmentedTabs } from "@/shared/ui/components/tabs";
import { atomLayout } from "@/shared/ui/components/theme";
import { ProjectCardSkeleton } from "@/features/projects/components/project-card-skeleton";
import {
  ProjectsTable,
  ProjectsTableSkeleton
} from "@/features/projects/components/projects-table";
import { useLayoutMode } from "@/shared/hooks/use-layout-mode";
import {
  getActiveFilterCount,
  getProjectGridMetrics,
  initialProjectFilters,
  type ProjectFilterState,
  type ProjectsViewMode
} from "@/features/projects/components/projects-screen/projects-screen.config";
import { projectsScreenStyles as styles } from "@/features/projects/components/projects-screen/projects-screen.styles";
import {
  ProjectFiltersModal,
  ProjectListItem,
  ProjectRowSeparator,
  ProjectsPaginationFooter
} from "@/features/projects/components/projects-screen/projects-screen-support";
import { useProjects } from "@/features/projects/hooks/use-projects";
import type {
  ProjectSort,
  ProjectSummary
} from "@/features/projects/types/project.types";
import {
  FilterIcon,
  GridIcon,
  MapPinIcon,
  SplitViewIcon,
  FolderPlusIcon,
  RefreshIcon,
  SortIcon
} from "@/shared/ui/icons";
import { useRouter } from "expo-router";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { useAppTopBarSearch } from "@/shared/hooks/use-app-topbar";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Platform,
  View,
  useWindowDimensions,
  type ListRenderItemInfo
} from "react-native";

export default function ProjectsScreen() {
  const router = useRouter();
  const { t } = useTranslation("features/projects");
  const { t: tShared } = useTranslation("shared");
  const { width } = useWindowDimensions();
  const { isCompact, isExpanded } = useLayoutMode();
  const canUseSplitView = Platform.OS === "web" && isExpanded;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProjectSort>("created_desc");
  const [viewMode, setViewMode] = useState<ProjectsViewMode>("list");
  const [filters, setFilters] = useState<ProjectFilterState>(
    initialProjectFilters
  );
  const [filtersVisible, setFiltersVisible] = useState(false);
  const searchPlaceholder = t(
    ($) => $["features/projects"].list.searchPlaceholder
  );
  const topBarSearch = useMemo(
    () =>
      !isCompact
        ? {
            onChangeText: setQuery,
            placeholder: searchPlaceholder,
            value: query
          }
        : null,
    [isCompact, query, searchPlaceholder]
  );
  useAppTopBarSearch(topBarSearch);
  const projectSortOptions = useMemo(
    () =>
      [
        {
          label: t(($) => $["features/projects"].sort.newest),
          value: "created_desc"
        },
        {
          label: t(($) => $["features/projects"].sort.oldest),
          value: "created_asc"
        },
        {
          label: t(($) => $["features/projects"].sort.ascending),
          value: "name_asc"
        },
        {
          label: t(($) => $["features/projects"].sort.descending),
          value: "name_desc"
        }
      ] satisfies { label: string; value: ProjectSort }[],
    [t]
  );
  const projectViewOptions = useMemo(
    () => [
      {
        label: t(($) => $["features/projects"].gallery.list),
        icon: GridIcon,
        value: "list" as const
      },
      ...(canUseSplitView
        ? [
            {
              label: t(($) => $["features/projects"].gallery.split),
              icon: SplitViewIcon,
              value: "split" as const
            }
          ]
        : []),
      {
        label: t(($) => $["features/projects"].gallery.map),
        icon: MapPinIcon,
        value: "map" as const
      }
    ],
    [canUseSplitView, t]
  );
  const projectsQuery = useProjects({
    ...filters,
    query,
    sort
  });
  const projects = useMemo(
    () => projectsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [projectsQuery.data]
  );
  const hasProjects = projects.length > 0;
  const activeFilterCount = getActiveFilterCount(filters);
  const hasSearchOrFilters =
    query.trim().length > 0 || activeFilterCount > 0 || sort !== "created_desc";
  const projectGrid = useMemo(
    () =>
      getProjectGridMetrics(
        width -
          (isCompact
            ? 0
            : isExpanded
              ? atomLayout.navigationSidebarWidth
              : atomLayout.navigationRailWidth)
      ),
    [width, isCompact, isExpanded]
  );
  const activeViewMode =
    viewMode === "split" && !canUseSplitView ? "list" : viewMode;
  const isSplitMode = activeViewMode === "split";
  const isMapMode = activeViewMode === "map" || isSplitMode;
  const isFullMapMode = activeViewMode === "map" && canUseSplitView;
  const isEdgeToEdge = isSplitMode || isFullMapMode;
  const mapScreenBottomPadding =
    width >= atomLayout.breakpointDesktop
      ? atomLayout.marginDesktop
      : width >= atomLayout.breakpointTablet
        ? atomLayout.marginTablet
        : atomLayout.marginMobile;

  const resetProjectView = () => {
    setQuery("");
    setSort("created_desc");
    setFilters(initialProjectFilters);
  };

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = projectsQuery;
  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const openProject = useCallback(
    (projectId: string) => {
      router.push(`/projects/${projectId}` as never);
    },
    [router]
  );
  const renderProject = useCallback(
    ({ index, item }: ListRenderItemInfo<ProjectSummary>) => (
      <ProjectListItem
        index={index}
        onPress={openProject}
        project={item}
        style={projectGrid.itemStyle}
      />
    ),
    [openProject, projectGrid.itemStyle]
  );

  const updateFilter = <TKey extends keyof ProjectFilterState>(
    key: TKey,
    value: ProjectFilterState[TKey]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

  const projectControls = (
    <View style={styles.controlsRow}>
      <SelectMenu
        accessibilityLabel={t(($) => $["features/projects"].accessibility.sort)}
        icon={SortIcon}
        labelPrefix={t(($) => $["features/projects"].sort.label)}
        onChange={setSort}
        options={projectSortOptions}
        value={sort}
      />
      <View style={styles.filterControl}>
        <AppButton
          color="neutral"
          fullWidth={false}
          icon={FilterIcon}
          size="sm"
          variant="bordered"
          onPress={() => setFiltersVisible(true)}
        >
          {activeFilterCount > 0
            ? t(($) => $["features/projects"].filters.activeCount, {
                activeCount: activeFilterCount
              })
            : t(($) => $["features/projects"].filters.label)}
        </AppButton>
      </View>
    </View>
  );
  const projectViewTabs = (
    <View
      style={[
        styles.viewTabs,
        isExpanded && !isSplitMode ? styles.viewTabsExpanded : undefined
      ]}
    >
      <SegmentedTabs
        iconOnly
        onChange={setViewMode}
        options={projectViewOptions}
        selectedTone="accent"
        value={activeViewMode}
      />
    </View>
  );

  const projectsHeader = (
    <View style={styles.listHeader}>
      <NavScreenHeader
        action={
          !isCompact ? (
            <AppButton
              fullWidth={false}
              icon={FolderPlusIcon}
              iconAfter={false}
              onPress={() => router.push("/projects/new" as never)}
              size="sm"
            >
              {t(($) => $["features/projects"].actions.new)}
            </AppButton>
          ) : null
        }
        title={t(($) => $["features/projects"].list.title)}
      />

      <View
        style={[styles.toolbar, isExpanded ? styles.toolbarExpanded : null]}
      >
        {isCompact ? (
          <View style={styles.searchFluid}>
            <SearchField
              onChangeText={setQuery}
              placeholder={searchPlaceholder}
              value={query}
            />
          </View>
        ) : null}

        {projectControls}

        {projectViewTabs}
      </View>
    </View>
  );

  const emptyContent = projectsQuery.isLoading ? (
    <View style={projectGrid.containerStyle}>
      {[0, 1, 2, 3].map((item) => (
        <View key={item} style={projectGrid.itemStyle}>
          <ProjectCardSkeleton />
        </View>
      ))}
    </View>
  ) : projectsQuery.isError ? (
    <InlineErrorState
      action={{
        icon: RefreshIcon,
        label: tShared(($) => $.shared.actions.retry),
        onPress: () => {
          void projectsQuery.refetch();
        }
      }}
      description={getUserFacingErrorMessage(
        projectsQuery.error,
        t(($) => $["features/projects"].errors.listLoad)
      )}
      title={t(($) => $["features/projects"].errors.listUnavailable)}
    />
  ) : (
    <EmptyState
      action={
        hasSearchOrFilters
          ? {
              icon: RefreshIcon,
              label: t(($) => $["features/projects"].actions.reset),
              onPress: resetProjectView
            }
          : {
              icon: FolderPlusIcon,
              label: t(($) => $["features/projects"].actions.newEmpty),
              onPress: () => router.push("/projects/new" as never)
            }
      }
      description={
        hasSearchOrFilters
          ? t(($) => $["features/projects"].list.filteredDescription)
          : t(($) => $["features/projects"].list.emptyDescription)
      }
      icon={hasSearchOrFilters ? FilterIcon : FolderPlusIcon}
      title={
        hasSearchOrFilters
          ? t(($) => $["features/projects"].list.filteredTitle)
          : t(($) => $["features/projects"].list.emptyTitle)
      }
    />
  );

  const paginationFooter = (
    <ProjectsPaginationFooter
      hasNextPage={Boolean(projectsQuery.hasNextPage)}
      isError={projectsQuery.isFetchNextPageError}
      isLoading={projectsQuery.isFetchingNextPage}
      onLoadMore={loadNextPage}
    />
  );

  return (
    <Screen
      contentContainerStyle={
        isEdgeToEdge
          ? styles.splitScreenContainer
          : isMapMode
            ? [
                styles.mapScreenContainer,
                { paddingBottom: mapScreenBottomPadding }
              ]
            : undefined
      }
      contentStyle={[
        styles.screenContent,
        isEdgeToEdge ? styles.splitScreenContent : null
      ]}
      floatingAction={
        hasProjects && !isMapMode && isCompact ? (
          <AppButton
            accessibilityLabel={t(
              ($) => $["features/projects"].accessibility.newProject
            )}
            icon={FolderPlusIcon}
            layout="icon"
            onPress={() => router.push("/projects/new" as never)}
            shape="pill"
            size="iconLg"
          />
        ) : null
      }
      scrollable={false}
    >
      {isSplitMode ? (
        <ProjectsSplitView
          onOpenProject={openProject}
          projects={projectsQuery.isError ? [] : projects}
          paginationFooter={paginationFooter}
          emptyContent={
            projectsQuery.isLoading ? <ProjectsTableSkeleton /> : emptyContent
          }
          floatingAction={
            <AppButton
              accessibilityLabel={t(
                ($) => $["features/projects"].accessibility.newProject
              )}
              fullWidth={false}
              icon={FolderPlusIcon}
              layout="icon"
              onPress={() => router.push("/projects/new" as never)}
              shape="pill"
              size="iconLg"
            />
          }
          sidebarHeader={
            <View style={styles.splitSidebarHeader}>{projectControls}</View>
          }
          viewSwitcher={projectViewTabs}
        />
      ) : isFullMapMode ? (
        <View style={styles.mapScreenStack}>
          <Suspense fallback={<ProjectCardSkeleton />}>
            <ProjectsMapView
              edgeToEdge
              fillAvailableSpace
              showMapWhenEmpty
              onOpenProject={(project) => openProject(project.id)}
              projects={projectsQuery.isError ? [] : projects}
            />
          </Suspense>
          <View style={styles.mapFloatingControls}>{projectControls}</View>
          <View style={styles.mapFloatingViewSwitcher}>{projectViewTabs}</View>
          {projectsQuery.isLoading || projectsQuery.isError || !hasProjects ? (
            <View style={styles.mapFloatingFeedback}>
              {projectsQuery.isLoading ? <ProjectCardSkeleton /> : emptyContent}
            </View>
          ) : null}
          {projectsQuery.hasNextPage ? (
            <View style={styles.mapFloatingPagination}>{paginationFooter}</View>
          ) : null}
        </View>
      ) : isMapMode ? (
        <View style={styles.mapScreenStack}>
          {projectsHeader}
          {hasProjects ? (
            <View style={styles.mapBody}>
              <Suspense
                fallback={
                  <View style={projectGrid.containerStyle}>
                    <View style={projectGrid.itemStyle}>
                      <ProjectCardSkeleton />
                    </View>
                  </View>
                }
              >
                <ProjectsMapView
                  fillAvailableSpace
                  onOpenProject={(project) => openProject(project.id)}
                  projects={projects}
                />
              </Suspense>
              {paginationFooter}
            </View>
          ) : (
            emptyContent
          )}
        </View>
      ) : isExpanded ? (
        <View style={styles.expandedList}>
          {projectsHeader}
          {projectsQuery.isLoading ? (
            <ProjectsTableSkeleton />
          ) : projectsQuery.isError || !hasProjects ? (
            emptyContent
          ) : (
            <>
              <ProjectsTable
                onOpenProject={(project) => openProject(project.id)}
                projects={projects}
              />
              {paginationFooter}
            </>
          )}
        </View>
      ) : (
        <FlatList
          columnWrapperStyle={
            projectGrid.columns > 1 ? styles.projectRow : undefined
          }
          contentContainerStyle={styles.projectListContent}
          data={projects}
          initialNumToRender={8}
          ItemSeparatorComponent={ProjectRowSeparator}
          key={`projects-${projectGrid.columns}`}
          keyExtractor={(project) => project.id}
          ListEmptyComponent={emptyContent}
          ListFooterComponent={hasProjects ? paginationFooter : null}
          ListHeaderComponent={projectsHeader}
          maxToRenderPerBatch={8}
          numColumns={projectGrid.columns}
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.5}
          renderItem={renderProject}
          showsVerticalScrollIndicator={false}
          windowSize={7}
        />
      )}
      <ProjectFiltersModal
        filters={filters}
        onChangeFilter={updateFilter}
        onClose={() => setFiltersVisible(false)}
        onReset={() => setFilters(initialProjectFilters)}
        visible={filtersVisible}
      />
    </Screen>
  );
}
