import { AppText } from "@/shared/ui/components/text";
import { getSansFontStyle } from "@/shared/theme/fonts";
import { TransitionView } from "@/shared/ui/components/transition-view";
import {
  atomControlHeights,
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import {
  CheckIcon,
  ChevronDownIcon,
  type AppIconComponent
} from "@/shared/ui/icons";
import { useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Image } from "expo-image";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  View,
  type LayoutRectangle,
  type ViewStyle
} from "react-native";

export interface SelectMenuOption<TValue extends string> {
  label: string;
  value: TValue;
}

export function SelectMenu<TValue extends string>({
  actions = [],
  renderMenu,
  accessibilityLabel,
  displayValue,
  eyebrow,
  fullWidth = false,
  icon: Icon,
  imageUri,
  iconOnly = false,
  labelPrefix,
  minWidth = 192,
  onChange,
  options,
  presentation = "default",
  value,
  valueSelected = true
}: {
  renderMenu?: (close: () => void) => ReactNode;
  actions?: {
    accessibilityLabel?: string;
    icon?: AppIconComponent;
    dividerBefore?: boolean;
    label: string;
    onPress: () => void;
    selected?: boolean;
    tone?: "accent" | "neutral";
  }[];
  accessibilityLabel?: string;
  displayValue?: string;
  eyebrow?: string;
  fullWidth?: boolean;
  icon?: AppIconComponent;
  imageUri?: string | null;
  iconOnly?: boolean;
  labelPrefix?: string;
  minWidth?: number;
  onChange: (value: TValue) => void;
  options: SelectMenuOption<TValue>[];
  presentation?: "default" | "workspace" | "workspace-mobile";
  value: TValue;
  valueSelected?: boolean;
}) {
  const isWorkspace =
    presentation === "workspace" || presentation === "workspace-mobile";
  const { t } = useTranslation("shared");
  const triggerRef = useRef<View>(null);
  const { height, width } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredActionIndex, setHoveredActionIndex] = useState<number | null>(
    null
  );
  const [hoveredValue, setHoveredValue] = useState<TValue | null>(null);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(
    null
  );
  const selectedOption =
    options.find((option) => option.value === value) ?? options[0];
  const menuWidth = Math.min(
    Math.max(triggerLayout?.width ?? minWidth, minWidth),
    width - atomSpacing[4] * 2
  );
  const menuHeightEstimate =
    options.length * (renderMenu ? 56 : 44) +
    atomSpacing[2] * 2 +
    actions.length * 40 +
    actions.filter((action) => action.dividerBefore).length * 13;
  const fallbackLeft = (width - menuWidth) / 2;
  const fallbackTop = (height - menuHeightEstimate) / 2;
  const menuLeft = clamp(
    triggerLayout?.x ?? fallbackLeft,
    atomSpacing[4],
    width - menuWidth - atomSpacing[4]
  );
  const preferredTop =
    (triggerLayout?.y ?? 0) + (triggerLayout?.height ?? 0) + atomSpacing[2];
  const menuTop =
    preferredTop + menuHeightEstimate > height - atomSpacing[4] && triggerLayout
      ? Math.max(atomSpacing[4], triggerLayout.y - menuHeightEstimate)
      : clamp(
          triggerLayout ? preferredTop : fallbackTop,
          atomSpacing[4],
          height - menuHeightEstimate - atomSpacing[4]
        );

  const openMenu = () => {
    setIsOpen(true);
    triggerRef.current?.measureInWindow(
      (x, y, measuredWidth, measuredHeight) => {
        setTriggerLayout({
          height: measuredHeight,
          width: measuredWidth,
          x,
          y
        });
      }
    );
  };

  return (
    <>
      <View
        collapsable={false}
        ref={triggerRef}
        style={isWorkspace || fullWidth ? styles.triggerRootFill : null}
      >
        <Pressable
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ expanded: isOpen }}
          accessibilityRole="button"
          onHoverIn={() => setIsTriggerHovered(true)}
          onHoverOut={() => setIsTriggerHovered(false)}
          onPress={openMenu}
          style={[
            styles.triggerRoot,
            isWorkspace || fullWidth ? styles.triggerRootFill : null,
            Platform.OS === "web" ? styles.webCursor : null
          ]}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.triggerSurface,
                isWorkspace ? styles.workspaceTriggerSurface : null,
                fullWidth ? styles.fullWidthTriggerSurface : null,
                presentation === "workspace-mobile"
                  ? styles.mobileWorkspaceSurface
                  : null,
                presentation === "workspace" && iconOnly
                  ? styles.workspaceIconOnlySurface
                  : null,
                isTriggerHovered ? styles.triggerHovered : null,
                pressed || isOpen ? styles.triggerPressed : null,
                isOpen && isWorkspace
                  ? {
                      borderColor: atomPalette.accent,
                      backgroundColor: atomPalette.surface
                    }
                  : null
              ]}
            >
              {imageUri ? (
                <Image
                  contentFit="cover"
                  source={{ uri: imageUri }}
                  style={styles.workspaceAvatar}
                />
              ) : Icon ? (
                <View style={isWorkspace ? styles.workspaceIconSurface : null}>
                  <Icon
                    color={isWorkspace ? atomPalette.accent : atomPalette.text}
                    size={iconOnly ? "md" : isWorkspace ? 20 : 16}
                    strokeWidth={1.9}
                  />
                </View>
              ) : null}
              {!iconOnly ? (
                <View style={styles.triggerCopy}>
                  {eyebrow ? (
                    <AppText numberOfLines={1} tone="muted" variant="eyebrow">
                      {eyebrow}
                    </AppText>
                  ) : null}
                  <AppText
                    numberOfLines={1}
                    style={[
                      styles.triggerLabel,
                      isWorkspace ? styles.workspaceTriggerLabel : null
                    ]}
                    variant="bodySm"
                  >
                    {labelPrefix
                      ? `${labelPrefix}: ${displayValue ?? selectedOption?.label ?? ""}`
                      : (displayValue ?? selectedOption?.label)}
                  </AppText>
                </View>
              ) : null}
              {!iconOnly ? (
                <ChevronDownIcon
                  color={atomPalette.text}
                  size={16}
                  strokeWidth={1.9}
                />
              ) : null}
            </View>
          )}
        </Pressable>
      </View>

      <Modal
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
        transparent
        visible={isOpen}
      >
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            accessibilityLabel={t(
              ($) => $.shared.accessibility.closeSelectMenu
            )}
            onPress={() => setIsOpen(false)}
            style={StyleSheet.absoluteFill}
          />
          <TransitionView
            animateEnter
            animateExit
            style={[
              styles.menu,
              renderMenu ? styles.customMenu : null,
              {
                left: menuLeft,
                top: menuTop,
                width: menuWidth,
                maxHeight: Math.max(80, height - menuTop - atomSpacing[4])
              }
            ]}
          >
            {renderMenu ? (
              <ScrollView>{renderMenu(() => setIsOpen(false))}</ScrollView>
            ) : (
              <>
                {options.map((option) => {
                  const isSelected = valueSelected && option.value === value;
                  const isHovered = hoveredValue === option.value;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      key={option.value}
                      onHoverIn={() => setHoveredValue(option.value)}
                      onHoverOut={() =>
                        setHoveredValue((current) =>
                          current === option.value ? null : current
                        )
                      }
                      onPress={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: resolveSelectMenuItemBackground({
                            hovered: isHovered,
                            pressed,
                            selected: isSelected
                          })
                        },
                        Platform.OS === "web" ? styles.webCursor : null
                      ]}
                    >
                      <AppText
                        numberOfLines={1}
                        tone={isSelected ? "accent" : "default"}
                        variant="bodySm"
                      >
                        {option.label}
                      </AppText>
                      {isSelected ? (
                        <CheckIcon color={atomPalette.accent} size={16} />
                      ) : null}
                    </Pressable>
                  );
                })}
                {actions.map((action, actionIndex) => {
                  const actionColor = action.selected
                    ? atomPalette.accent
                    : action.tone === "accent"
                      ? atomPalette.accent
                      : atomPalette.text;
                  const isHovered = hoveredActionIndex === actionIndex;

                  return (
                    <View key={action.label}>
                      {action.dividerBefore ? (
                        <View style={styles.actionDivider} />
                      ) : null}
                      <Pressable
                        accessibilityLabel={
                          action.accessibilityLabel ?? action.label
                        }
                        accessibilityRole="button"
                        accessibilityState={{ selected: action.selected }}
                        onHoverIn={() => setHoveredActionIndex(actionIndex)}
                        onHoverOut={() =>
                          setHoveredActionIndex((current) =>
                            current === actionIndex ? null : current
                          )
                        }
                        onPress={() => {
                          setIsOpen(false);
                          action.onPress();
                        }}
                        style={({ pressed }) => [
                          styles.action,
                          {
                            backgroundColor: resolveSelectMenuItemBackground({
                              hovered: isHovered,
                              pressed,
                              selected: action.selected ?? false
                            })
                          },
                          Platform.OS === "web" ? styles.webCursor : null
                        ]}
                      >
                        {action.icon ? (
                          <action.icon color={actionColor} size={16} />
                        ) : null}
                        <AppText
                          tone={
                            action.selected || action.tone === "accent"
                              ? "accent"
                              : "default"
                          }
                          variant="bodySm"
                        >
                          {action.label}
                        </AppText>
                      </Pressable>
                    </View>
                  );
                })}
              </>
            )}
          </TransitionView>
        </View>
      </Modal>
    </>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function resolveSelectMenuItemBackground({
  hovered,
  pressed,
  selected
}: {
  hovered: boolean;
  pressed: boolean;
  selected: boolean;
}) {
  if (pressed) {
    return atomPalette.surfaceStrong;
  }

  if (selected) {
    return `${atomPalette.accent}10`;
  }

  return hovered ? atomPalette.surfaceLow : undefined;
}

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: atomRadii.md,
    flexDirection: "row",
    gap: atomSpacing[2],
    minHeight: 40,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[2]
  },
  actionDivider: {
    backgroundColor: atomPalette.borderSubtle,
    height: 1,
    marginHorizontal: atomSpacing[2],
    marginVertical: atomSpacing[1]
  },
  fullWidthTriggerSurface: {
    justifyContent: "space-between",
    minHeight: atomControlHeights.lg,
    width: "100%"
  },
  menu: {
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.borderSubtle,
    borderRadius: atomRadii.sm,
    borderWidth: 1,
    gap: atomSpacing[1],
    padding: atomSpacing[1],
    position: "absolute"
  },
  customMenu: {
    padding: 0,
    gap: 0,
    borderRadius: atomRadii.lg,
    overflow: "hidden",
    boxShadow: "0 12px 32px rgba(20, 22, 28, 0.12)"
  },
  triggerHovered: {
    backgroundColor: atomPalette.surfaceRaised,
    borderColor: atomPalette.borderStrong
  },
  triggerLabel: {
    flexShrink: 1
  },
  triggerCopy: {
    flex: 1,
    minWidth: 0
  },
  triggerPressed: {
    backgroundColor: atomPalette.surfaceStrong,
    borderColor: atomPalette.borderStrong
  },
  triggerRoot: {
    alignSelf: "flex-start",
    flexShrink: 0
  },
  triggerRootFill: {
    alignSelf: "stretch",
    width: "100%"
  },
  triggerSurface: {
    alignItems: "center",
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.border,
    borderRadius: atomRadii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: atomSpacing[2],
    justifyContent: "center",
    minHeight: atomControlHeights.sm,
    minWidth: 0,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[1]
  },
  workspaceIconSurface: {
    alignItems: "center",
    backgroundColor: `${atomPalette.accent}10`,
    borderRadius: atomRadii.md,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  workspaceAvatar: {
    borderRadius: atomRadii.md,
    height: 40,
    width: 40
  },
  workspaceTriggerLabel: {
    ...getSansFontStyle("600")
  },
  workspaceTriggerSurface: {
    backgroundColor: atomPalette.surfaceLow,
    borderColor: atomPalette.borderSubtle,
    justifyContent: "flex-start",
    minHeight: 72,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[3],
    width: "100%"
  },
  mobileWorkspaceSurface: {
    backgroundColor: atomPalette.surface,
    minHeight: 52,
    paddingVertical: atomSpacing[1],
    paddingHorizontal: atomSpacing[2]
  },
  workspaceIconOnlySurface: {
    justifyContent: "center",
    paddingHorizontal: atomSpacing[2]
  },
  option: {
    alignItems: "center",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: atomRadii.md,
    flexDirection: "row",
    gap: atomSpacing[2],
    justifyContent: "space-between",
    minHeight: 38,
    paddingHorizontal: atomSpacing[3],
    paddingVertical: atomSpacing[2]
  },
  webCursor: {
    cursor: "pointer"
  } as ViewStyle
});
