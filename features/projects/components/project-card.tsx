import { AppBadge, AppCard, AppHeading, AppText } from "@/components/atoms";
import { atomPalette, atomSpacing } from "@/components/atoms/theme";
import {
  PROJECT_PHASE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS
} from "@/features/projects/constants";
import type { Project } from "@/features/projects/types";
import { Image } from "expo-image";
import { CalendarDays, MapPinned } from "lucide-react-native";
import { Platform, Pressable, View, type ViewStyle } from "react-native";

export function ProjectCard({
  isDeleting = false,
  onPress,
  project
}: {
  isDeleting?: boolean;
  onPress: () => void;
  project: Project;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDeleting}
      onPress={onPress}
      style={({ pressed }) =>
        [
          {
            opacity: isDeleting ? 0.55 : pressed ? 0.82 : 1
          },
          Platform.OS === "web" && !isDeleting
            ? ({ cursor: "pointer" } as ViewStyle)
            : null
        ] as ViewStyle[]
      }
    >
      <AppCard padding="md" tone="raised">
        <View style={{ gap: atomSpacing[4] }}>
          <View
            style={{
              backgroundColor: atomPalette.surfaceLow,
              borderRadius: 12,
              height: 150,
              overflow: "hidden"
            }}
          >
            {project.cover_image_url ? (
              <Image
                contentFit="cover"
                source={{ uri: project.cover_image_url }}
                style={{ height: "100%", width: "100%" }}
              />
            ) : (
              <View
                style={{
                  alignItems: "center",
                  flex: 1,
                  justifyContent: "center"
                }}
              >
                <MapPinned color={atomPalette.textSubtle} size={28} />
              </View>
            )}
          </View>

          <View style={{ gap: atomSpacing[3] }}>
            <View
              style={{
                alignItems: "flex-start",
                flexDirection: "row",
                gap: atomSpacing[3],
                justifyContent: "space-between"
              }}
            >
              <View style={{ flex: 1, gap: atomSpacing[2] }}>
                <AppText variant="eyebrow">
                  {PROJECT_TYPE_LABELS[project.project_type]}
                </AppText>
                <AppHeading variant="card">{project.name}</AppHeading>
              </View>
              <AppBadge
                tone={project.status === "completed" ? "success" : "accent"}
              >
                {PROJECT_STATUS_LABELS[project.status]}
              </AppBadge>
            </View>

            <View style={{ gap: atomSpacing[2] }}>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: atomSpacing[2]
                }}
              >
                <MapPinned color={atomPalette.textMuted} size={16} />
                <AppText
                  numberOfLines={1}
                  style={{ flex: 1 }}
                  tone="muted"
                  variant="bodySm"
                >
                  {project.address}
                </AppText>
              </View>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: atomSpacing[2]
                }}
              >
                <CalendarDays color={atomPalette.textMuted} size={16} />
                <AppText tone="muted" variant="bodySm">
                  {PROJECT_PHASE_LABELS[project.phase]} /{" "}
                  {project.progress_percentage}%
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}
