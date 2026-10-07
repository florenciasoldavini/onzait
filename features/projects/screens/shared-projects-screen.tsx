import { ProjectCard } from "@/features/projects/components/project-card";
import { useSharedProjects } from "@/features/projects/hooks/use-shared-projects";
import { EmptyState } from "@/shared/ui/components/empty-state";
import { InlineErrorState } from "@/shared/ui/components/inline-error-state";
import { NavScreenHeader } from "@/shared/ui/components/nav-screen-header";
import { Screen } from "@/shared/ui/components/screen";
import { SkeletonBlock } from "@/shared/ui/components/skeleton-block";
import { atomSpacing } from "@/shared/ui/components/theme";
import { FolderOpenIcon, RefreshIcon } from "@/shared/ui/icons";
import { getUserFacingErrorMessage } from "@/shared/utils/user-facing-errors";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

export default function SharedProjectsScreen() {
  const query = useSharedProjects();
  const router = useRouter();
  const { t } = useTranslation("features/projects");
  const { t: tShared } = useTranslation("shared");
  const projects = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data]
  );

  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <NavScreenHeader
          description={t(($) => $["features/projects"].shared.description)}
          title={t(($) => $["features/projects"].shared.title)}
        />
        {query.isLoading ? (
          <View style={{ gap: atomSpacing[4] }}>
            <SkeletonBlock height={240} />
            <SkeletonBlock height={240} />
          </View>
        ) : query.isError ? (
          <InlineErrorState
            action={{
              icon: RefreshIcon,
              label: tShared(($) => $.shared.actions.retry),
              onPress: () => void query.refetch()
            }}
            description={getUserFacingErrorMessage(
              query.error,
              t(($) => $["features/projects"].shared.error)
            )}
            title={t(($) => $["features/projects"].shared.errorTitle)}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            description={t(
              ($) => $["features/projects"].shared.emptyDescription
            )}
            icon={FolderOpenIcon}
            title={t(($) => $["features/projects"].shared.emptyTitle)}
          />
        ) : (
          <View style={{ gap: atomSpacing[4] }}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                onPress={() => router.push(`/projects/${project.id}` as never)}
                project={project}
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
