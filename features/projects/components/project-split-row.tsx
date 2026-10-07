import { PROJECT_LABELS_BY_LANGUAGE } from "@/features/projects/constants/project.constants";
import { useLocalization } from "@/features/localization/hooks/use-localization";
import { projectsSplitStyles as styles } from "@/features/projects/components/projects-split-view.styles";
import type { ProjectSummary } from "@/features/projects/types/project.types";
import { AppButton } from "@/shared/ui/components/button";
import { AppText } from "@/shared/ui/components/text";
import { atomPalette } from "@/shared/ui/components/theme";
import { ArrowRightIcon, ImageOffIcon } from "@/shared/ui/icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";

export function ProjectSplitRow({
  onHighlight,
  onOpenProject,
  onSelect,
  project,
  selected
}: {
  onHighlight: (id: string | null) => void;
  onOpenProject: (id: string) => void;
  onSelect: (id: string) => void;
  project: ProjectSummary;
  selected: boolean;
}) {
  const { language, formattingLocale } = useLocalization();
  const { t } = useTranslation("features/projects");
  const [hovered, setHovered] = useState(false);
  const [failedCover, setFailedCover] = useState<string | null>(null);
  const progress = Math.min(100, Math.max(0, project.progress_percentage));
  const progressColor =
    project.status === "completed" ? atomPalette.success : atomPalette.accent;
  const highlight = (active: boolean) => {
    setHovered(active);
    onHighlight(active ? project.id : null);
  };

  return (
    <View
      style={[
        styles.row,
        selected ? styles.selectedRow : hovered ? styles.hoveredRow : null
      ]}
    >
      <Pressable
        accessibilityLabel={t(
          ($) => $["features/projects"].gallery.selectOnMap,
          { name: project.name }
        )}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onBlur={() => highlight(false)}
        onFocus={() => highlight(true)}
        onHoverIn={() => highlight(true)}
        onHoverOut={() => highlight(false)}
        onPress={() => onSelect(project.id)}
        style={styles.rowSelect}
      >
        <View style={styles.thumbnail}>
          {project.cover_image_url &&
          failedCover !== project.cover_image_url ? (
            <Image
              contentFit="cover"
              onError={() => setFailedCover(project.cover_image_url ?? null)}
              source={{ uri: project.cover_image_url }}
              style={styles.cover}
            />
          ) : (
            <ImageOffIcon color={atomPalette.textSubtle} size={22} />
          )}
        </View>
        <View style={styles.rowContent}>
          <AppText numberOfLines={1} tone="muted" variant="caption">
            {PROJECT_LABELS_BY_LANGUAGE[language].statuses[project.status]}
          </AppText>
          <AppText numberOfLines={1} variant="label">
            {project.name}
          </AppText>
          <AppText numberOfLines={1} tone="muted" variant="caption">
            {project.address}
          </AppText>
          <View style={styles.progressRow}>
            <View
              accessibilityLabel={t(
                ($) => $["features/projects"].accessibility.progress,
                { progress }
              )}
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: progress }}
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: progressColor, width: `${progress}%` }
                ]}
              />
            </View>
            <AppText variant="caption" style={{ color: progressColor }}>
              {new Intl.NumberFormat(formattingLocale, {
                style: "percent"
              }).format(progress / 100)}
            </AppText>
          </View>
        </View>
      </Pressable>
      <AppButton
        accessibilityLabel={t(
          ($) => $["features/projects"].accessibility.openProject,
          { name: project.name }
        )}
        color="neutral"
        icon={ArrowRightIcon}
        layout="icon"
        onPress={() => onOpenProject(project.id)}
        size="sm"
        variant="ghost"
      />
    </View>
  );
}
