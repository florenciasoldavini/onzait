import { useState } from "react";
import { Pressable, type PressableProps } from "react-native";
import { workspacePickerStyles as styles } from "./workspace-picker-menu.styles";

export function WorkspacePickerRow({
  highlighted = false,
  children,
  ...props
}: Pick<
  PressableProps,
  "children" | "onPress" | "accessibilityLabel" | "accessibilityState"
> & {
  highlighted?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.row,
        highlighted && styles.selected,
        (hovered || focused) &&
          (highlighted ? styles.highlightedHover : styles.hovered),
        pressed && styles.pressed
      ]}
    >
      {children}
    </Pressable>
  );
}
