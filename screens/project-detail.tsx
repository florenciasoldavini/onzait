import {
  AppButton,
  Breadcrumb,
  AppCard,
  AppHeading,
  AppText,
  Screen,
  SkeletonBlock
} from "@/components/atoms";
import { atomSpacing } from "@/components/atoms/theme";
import { useProject } from "@/features/projects/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pencil } from "lucide-react-native";
import { View } from "react-native";

export default function ProjectDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ projectId: string }>();
  const projectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const projectQuery = useProject(projectId);

  if (projectQuery.isLoading) {
    return (
      <Screen>
        <View style={{ gap: atomSpacing[5] }}>
          <SkeletonBlock height={36} width="60%" />
          <SkeletonBlock height={220} />
          <SkeletonBlock height={160} />
        </View>
      </Screen>
    );
  }

  if (!projectQuery.data) {
    return (
      <Screen centered>
        <AppCard padding="lg">
          <View style={{ gap: atomSpacing[4] }}>
            <AppHeading variant="section">Project not found</AppHeading>
            <AppText tone="muted">
              This project may have been archived or you may not have access.
            </AppText>
            <AppButton onPress={() => router.replace("/projects" as never)}>
              Back to projects
            </AppButton>
          </View>
        </AppCard>
      </Screen>
    );
  }

  const project = projectQuery.data;

  return (
    <Screen>
      <View style={{ gap: atomSpacing[6] }}>
        <View style={{ gap: atomSpacing[3] }}>
          <Breadcrumb
            items={[
              {
                accessibilityLabel: "Back to projects",
                label: "Projects",
                onPress: () => router.replace("/projects" as never)
              },
              { label: "Project Detail" }
            ]}
          />
          <AppHeading variant="hero">{project.name}</AppHeading>
          <AppText selectable tone="muted">
            {project.address}
          </AppText>
          <AppButton
            fullWidth={false}
            icon={Pencil}
            iconAfter={false}
            onPress={() => router.push(`/projects/${project.id}/edit` as never)}
            size="sm"
            style={{ alignSelf: "flex-start" }}
          >
            Edit Project
          </AppButton>
        </View>

        <AppCard padding="lg" tone="muted">
          <View style={{ gap: atomSpacing[3] }}>
            <AppText variant="eyebrow">Details</AppText>
            <AppHeading variant="section">
              Project detail page is ready.
            </AppHeading>
            <AppText tone="muted">
              The route, loading state, permission-aware fetch, and edit action
              are wired. The operational detail modules can be added in the next
              feature slice.
            </AppText>
          </View>
        </AppCard>
      </View>
    </Screen>
  );
}
