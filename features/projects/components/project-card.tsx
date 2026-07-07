import { AppCard, AppHeading, AppText } from "@/components/atoms";
import {
  atomCardRadius,
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/components/atoms/theme";
import {
  PROJECT_PHASE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_TYPE_LABELS
} from "@/features/projects/constants";
import type { Project } from "@/features/projects/types";
import { Image } from "expo-image";
import { ImageOff, MapPinned } from "lucide-react-native";
import { useEffect } from "react";
import {
  Platform,
  Pressable,
  View,
  type DimensionValue,
  type ViewStyle
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

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
      <AppCard>
        <View style={{ gap: atomSpacing[4], marginBottom: atomSpacing[5] }}>
          <View
            style={{
              backgroundColor: atomPalette.surfaceLow,
              height: 150,
              marginHorizontal: -atomSpacing[5],
              marginTop: -atomSpacing[5],
              overflow: "hidden",
              position: "relative"
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
                <ImageOff color={atomPalette.textSubtle} size={28} />
              </View>
            )}
            <ProjectStatusCornerLabel
              status={PROJECT_STATUS_LABELS[project.status]}
            />
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
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: atomSpacing[2]
                }}
              >
                <ProjectMetaLabel
                  value={`PHASE_${formatMonoLabel(
                    PROJECT_PHASE_LABELS[project.phase]
                  )}`}
                />
                <ProjectMetaLabel
                  value={`ETA_${formatEstimatedCompletion(
                    project.estimated_end_date
                  )}`}
                />
              </View>
            </View>
          </View>
        </View>
        <ProjectProgressIndicator progress={project.progress_percentage} />
      </AppCard>
    </Pressable>
  );
}

function ProjectMetaLabel({ value }: { value: string }) {
  return (
    <View
      style={{
        borderColor: atomPalette.borderSubtle,
        borderRadius: atomRadii.full,
        borderWidth: 1,
        paddingHorizontal: atomSpacing[2],
        paddingVertical: 2
      }}
    >
      <AppText tone="subtle" variant="meta">
        {value}
      </AppText>
    </View>
  );
}

function ProjectProgressIndicator({ progress }: { progress: number }) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={{ gap: atomSpacing[2] }}>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <AppText tone="subtle" variant="meta">
          PROGRESS
        </AppText>
        <AppText
          tone="accent"
          variant="meta"
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {clampedProgress}%
        </AppText>
      </View>
      <ProjectProgressBar progress={clampedProgress} />
    </View>
  );
}

function ProjectProgressBar({ progress }: { progress: number }) {
  const progressWidth: DimensionValue =
    progress === 0 ? 12 : `${progress}%`;

  return (
    <View
      accessibilityLabel={`Project progress ${progress}%`}
      style={{
        backgroundColor: `${atomPalette.accent}1A`,
        borderRadius: atomRadii.full,
        height: 8,
        overflow: "hidden",
        position: "relative"
      }}
    >
      <View
        style={{
          backgroundColor: atomPalette.accent,
          borderRadius: atomRadii.full,
          height: "100%",
          width: progressWidth
        }}
      />
    </View>
  );
}

function formatEstimatedCompletion(value: string | null) {
  return value?.trim() || "TBD";
}

function formatMonoLabel(value: string) {
  return value.trim().toUpperCase().replaceAll(" ", "_");
}

function ProjectStatusCornerLabel({ status }: { status: string }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 900,
          easing: Easing.out(Easing.ease)
        }),
        withTiming(0, {
          duration: 900,
          easing: Easing.in(Easing.ease)
        })
      ),
      -1
    );

    return () => {
      cancelAnimation(pulse);
    };
  }, [pulse]);

  const pulseHaloStyle = useAnimatedStyle(() => ({
    opacity: 0.38 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 1.4 }]
  }));
  const pulseDotStyle = useAnimatedStyle(() => ({
    opacity: 1 - pulse.value * 0.28,
    transform: [{ scale: 1 + pulse.value * 0.28 }]
  }));

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: `${atomPalette.surface}E6`,
        borderBottomColor: atomPalette.border,
        borderBottomLeftRadius: atomCardRadius,
        borderBottomWidth: 1,
        borderLeftColor: atomPalette.border,
        borderLeftWidth: 1,
        borderTopRightRadius: atomCardRadius,
        flexDirection: "row",
        gap: atomSpacing[2],
        height: 36,
        justifyContent: "center",
        minWidth: 128,
        paddingHorizontal: atomSpacing[4],
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 2
      }}
    >
      <View
        style={{
          alignItems: "center",
          height: 16,
          justifyContent: "center",
          width: 16
        }}
      >
        <Animated.View
          style={[
            {
              backgroundColor: atomPalette.accent,
              borderRadius: atomRadii.full,
              height: 8,
              position: "absolute",
              width: 8
            },
            pulseHaloStyle
          ]}
        />
        <Animated.View
          style={[
            {
              backgroundColor: atomPalette.accent,
              borderRadius: atomRadii.full,
              height: 8,
              width: 8
            },
            pulseDotStyle
          ]}
        />
      </View>
      <AppText tone="accent" variant="meta">
        {status.toUpperCase().replaceAll(" ", "_")}
      </AppText>
    </View>
  );
}
