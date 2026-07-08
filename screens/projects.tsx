import {
  AppButton,
  AppCard,
  AppText,
  EmptyState,
  MultiSelectField,
  NavScreenHeader,
  Screen,
  SelectMenu,
  TextField
} from "@/components/atoms";
import { atomMotion } from "@/components/atoms/motion";
import {
  atomLayout,
  atomPalette,
  atomSpacing
} from "@/components/atoms/theme";
import { ProjectCard } from "@/features/projects/components/project-card";
import { ProjectCardSkeleton } from "@/features/projects/components/project-card-skeleton";
import {
  PROJECT_BUILDING_TYPES,
  PROJECT_BUILDING_TYPE_LABELS,
  PROJECT_PHASES,
  PROJECT_PHASE_LABELS,
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS
} from "@/features/projects/constants";
import { useProjects } from "@/features/projects/hooks";
import type {
  ProjectBuildingType,
  ProjectFilters,
  ProjectPhase,
  ProjectSort,
  ProjectStatus,
  ProjectType
} from "@/features/projects/types";
import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  FolderPlus,
  RefreshCw,
  Search,
  SlidersHorizontal
} from "lucide-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";

type ProjectFilterState = Required<
  Pick<ProjectFilters, "buildingTypes" | "phases" | "projectTypes" | "statuses">
>;

const initialProjectFilters: ProjectFilterState = {
  buildingTypes: [],
  phases: [],
  projectTypes: [],
  statuses: []
};

const projectSortOptions = [
  { label: "Newest", value: "created_desc" },
  { label: "Oldest", value: "created_asc" },
  { label: "A-Z", value: "name_asc" },
  { label: "Z-A", value: "name_desc" }
] satisfies { label: string; value: ProjectSort }[];

const statusFilterOptions = createFilterOptions<ProjectStatus>(
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS
);
const phaseFilterOptions = createFilterOptions<ProjectPhase>(
  PROJECT_PHASES,
  PROJECT_PHASE_LABELS
);
const projectTypeFilterOptions = createFilterOptions<ProjectType>(
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS
);
const buildingTypeFilterOptions = createFilterOptions<ProjectBuildingType>(
  PROJECT_BUILDING_TYPES,
  PROJECT_BUILDING_TYPE_LABELS
);

export default function ProjectsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProjectSort>("created_desc");
  const [filters, setFilters] = useState<ProjectFilterState>(
    initialProjectFilters
  );
  const [filtersVisible, setFiltersVisible] = useState(false);
  const projectsQuery = useProjects({
    ...filters,
    query,
    sort
  });
  const hasProjects = Boolean(projectsQuery.data?.length);
  const activeFilterCount = getActiveFilterCount(filters);
  const hasSearchOrFilters =
    query.trim().length > 0 || activeFilterCount > 0 || sort !== "created_desc";
  const projectGrid = getProjectGridMetrics(width);

  const resetProjectView = () => {
    setQuery("");
    setSort("created_desc");
    setFilters(initialProjectFilters);
  };

  const updateFilter = <TKey extends keyof ProjectFilterState>(
    key: TKey,
    value: ProjectFilterState[TKey]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  };

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
        <NavScreenHeader title="Projects" />

        <TextField
          leftIcon={Search}
          onChangeText={setQuery}
          placeholder="Search projects"
          value={query}
        />

        <View style={styles.controlsRow}>
          <SelectMenu
            accessibilityLabel="Sort projects"
            icon={ArrowUpDown}
            labelPrefix="Sort"
            onChange={setSort}
            options={projectSortOptions}
            value={sort}
          />
          <View style={styles.filterControl}>
            <AppButton
              color="neutral"
              fullWidth={false}
              icon={SlidersHorizontal}
              size="sm"
              variant="bordered"
              onPress={() => setFiltersVisible(true)}
            >
              {activeFilterCount > 0
                ? `Filters (${activeFilterCount})`
                : "Filters"}
            </AppButton>
          </View>
        </View>

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
            action={
              hasSearchOrFilters
                ? {
                    icon: RefreshCw,
                    label: "Reset view",
                    onPress: resetProjectView
                  }
                : {
                    icon: FolderPlus,
                    label: "New Project",
                    onPress: () => router.push("/projects/new" as never)
                  }
            }
            description={
              hasSearchOrFilters
                ? "Adjust the search, sort, or filters to widen the project list."
                : "Create your first project to start organizing job-site work."
            }
            icon={hasSearchOrFilters ? SlidersHorizontal : FolderPlus}
            title={hasSearchOrFilters ? "No matching projects" : "No projects yet"}
          />
        )}
      </View>
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

function ProjectFiltersModal({
  filters,
  onChangeFilter,
  onClose,
  onReset,
  visible
}: {
  filters: ProjectFilterState;
  onChangeFilter: <TKey extends keyof ProjectFilterState>(
    key: TKey,
    value: ProjectFilterState[TKey]
  ) => void;
  onClose: () => void;
  onReset: () => void;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Close project filters"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View pointerEvents="none" style={styles.modalBackdrop} />
        <Animated.View
          entering={FadeIn.duration(atomMotion.duration.enter)}
          style={styles.modalContent}
        >
          <AppCard padding="md" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="formLabel">Project filters</AppText>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <MultiSelectField
                label="Status"
                onChange={(value) => onChangeFilter("statuses", value)}
                options={statusFilterOptions}
                value={filters.statuses}
              />
              <MultiSelectField
                label="Phase"
                onChange={(value) => onChangeFilter("phases", value)}
                options={phaseFilterOptions}
                value={filters.phases}
              />
              <MultiSelectField
                label="Project type"
                onChange={(value) => onChangeFilter("projectTypes", value)}
                options={projectTypeFilterOptions}
                value={filters.projectTypes}
              />
              <MultiSelectField
                label="Building type"
                onChange={(value) => onChangeFilter("buildingTypes", value)}
                options={buildingTypeFilterOptions}
                value={filters.buildingTypes}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <View style={styles.modalFooterAction}>
                <AppButton
                  color="neutral"
                  onPress={onReset}
                  size="md"
                  variant="bordered"
                >
                  Clear
                </AppButton>
              </View>
              <View style={styles.modalFooterAction}>
                <AppButton onPress={onClose} size="md">
                  Done
                </AppButton>
              </View>
            </View>
          </AppCard>
        </Animated.View>
      </View>
    </Modal>
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

function createFilterOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>
) {
  return values.map((value) => ({
    label: labels[value],
    value
  }));
}

function getActiveFilterCount(filters: ProjectFilterState) {
  return Object.values(filters).reduce(
    (total, selectedValues) => total + selectedValues.length,
    0
  );
}

const styles = StyleSheet.create({
  controlsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: atomSpacing[2]
  },
  filterControl: {
    flexShrink: 0
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 22, 28, 0.18)"
  },
  modalBody: {
    gap: atomSpacing[5],
    paddingBottom: atomSpacing[1]
  },
  modalCard: {
    borderColor: atomPalette.borderSubtle,
    maxHeight: "86%",
    width: "100%"
  },
  modalContent: {
    maxWidth: 560,
    width: "100%"
  },
  modalFooter: {
    flexDirection: "row",
    gap: atomSpacing[3],
    paddingTop: atomSpacing[5]
  },
  modalFooterAction: {
    flex: 1
  },
  modalHeader: {
    borderBottomColor: atomPalette.borderSubtle,
    borderBottomWidth: 1,
    marginBottom: atomSpacing[5],
    paddingBottom: atomSpacing[4]
  },
  modalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: atomSpacing[4]
  },
  sortControl: {
    flex: 1,
    minWidth: 0
  }
});
