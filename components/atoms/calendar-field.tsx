import { AppButton } from "@/components/atoms/button";
import { AppHeading } from "@/components/atoms/heading";
import { AppText } from "@/components/atoms/text";
import {
  atomControlHeights,
  atomControlRadius,
  atomPalette,
  atomSpacing
} from "@/components/atoms/theme";
import { FormField } from "@/components/molecules";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  type AppIconComponent
} from "@/components/icons";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type ViewStyle
} from "react-native";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function CalendarField({
  errorText,
  label,
  onBlur,
  onChange,
  value
}: {
  errorText?: string | null;
  label: string;
  onBlur?: () => void;
  onChange: (date: string) => void;
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonth(value));
  const selectedDate = parseDate(value);
  const calendarDays = getDays(visibleMonth);

  useEffect(() => {
    if (isOpen) setVisibleMonth(getMonth(value));
  }, [isOpen, value]);

  const close = () => {
    setIsOpen(false);
    onBlur?.();
  };

  const selectDate = (date: Date) => {
    onChange(toDateValue(date));
    close();
  };

  return (
    <FormField errorText={errorText} label={label}>
      <Pressable
        accessibilityLabel={`${label} calendar`}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        style={StyleSheet.flatten([
          styles.trigger,
          errorText ? styles.triggerError : null,
          Platform.OS === "web" ? styles.webCursor : null
        ])}
      >
        <CalendarIcon
          color={value ? atomPalette.text : atomPalette.textMuted}
          size={18}
        />
        <AppText tone={value ? "default" : "subtle"} variant="body">
          {value || "Select date"}
        </AppText>
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={close}
        transparent
        visible={isOpen}
      >
        <View style={styles.backdrop}>
          <Pressable
            accessibilityLabel="Close calendar"
            onPress={close}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modal}>
            <View style={styles.header}>
              <CalendarIconButton
                accessibilityLabel="Previous month"
                icon={ChevronLeftIcon}
                onPress={() =>
                  setVisibleMonth(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
              />
              <AppHeading selectable variant="section">
                {formatMonth(visibleMonth)}
              </AppHeading>
              <CalendarIconButton
                accessibilityLabel="Next month"
                icon={ChevronRightIcon}
                onPress={() =>
                  setVisibleMonth(
                    (current) =>
                      new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
              />
            </View>

            <View style={styles.weekdays}>
              {weekdayLabels.map((weekday) => (
                <AppText key={weekday} style={styles.weekday} variant="meta">
                  {weekday}
                </AppText>
              ))}
            </View>

            <View style={styles.grid}>
              {calendarDays.map((day) => {
                const isSelected =
                  selectedDate &&
                  toDateValue(selectedDate) === toDateValue(day.date);

                return (
                  <Pressable
                    accessibilityLabel={`Select ${toDateValue(day.date)}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: Boolean(isSelected) }}
                    key={day.key}
                    onPress={() => selectDate(day.date)}
                    style={StyleSheet.flatten([
                      styles.day,
                      day.isCurrentMonth ? null : styles.dayOutside,
                      isSelected ? styles.daySelected : null,
                      Platform.OS === "web" ? styles.webCursor : null
                    ])}
                  >
                    <AppText
                      style={StyleSheet.flatten([
                        styles.dayText,
                        day.isCurrentMonth ? null : styles.dayTextOutside,
                        isSelected ? styles.dayTextSelected : null
                      ])}
                      variant="bodySm"
                    >
                      {day.date.getDate()}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <AppButton
                color="neutral"
                fullWidth={false}
                onPress={() => {
                  onChange("");
                  close();
                }}
                size="sm"
                variant="bordered"
              >
                Clear
              </AppButton>
              <AppButton fullWidth={false} onPress={close} size="sm">
                Done
              </AppButton>
            </View>
          </View>
        </View>
      </Modal>
    </FormField>
  );
}

function CalendarIconButton({
  accessibilityLabel,
  icon: Icon,
  onPress
}: {
  accessibilityLabel: string;
  icon: AppIconComponent;
  onPress: (event: GestureResponderEvent) => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={StyleSheet.flatten([
        styles.iconButton,
        Platform.OS === "web" ? styles.webCursor : null
      ])}
    >
      <Icon color={atomPalette.text} size={20} />
    </Pressable>
  );
}

function getMonth(value: string) {
  const source = parseDate(value) ?? new Date();
  return new Date(source.getFullYear(), source.getMonth(), 1);
}

function getDays(visibleMonth: Date) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();

  return Array.from({ length: 42 }, (_, offset) => {
    const date = new Date(year, month, offset - firstWeekday + 1);
    return {
      date,
      isCurrentMonth: date.getMonth() === month,
      key: toDateValue(date)
    };
  });
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
}

function formatMonth(date: Date) {
  return `${monthLabels[date.getMonth()]} ${date.getFullYear()}`;
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: atomSpacing[3],
    justifyContent: "flex-end"
  },
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(18, 18, 18, 0.28)",
    flex: 1,
    justifyContent: "center",
    padding: atomSpacing[5]
  },
  day: {
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: "center",
    width: `${100 / 7}%`
  },
  dayOutside: { opacity: 0.42 },
  daySelected: { backgroundColor: atomPalette.accent },
  dayText: { color: atomPalette.text, fontWeight: "700" },
  dayTextOutside: { color: atomPalette.textMuted },
  dayTextSelected: { color: atomPalette.accentText },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: atomPalette.surfaceLow,
    borderColor: atomPalette.borderSubtle,
    borderRadius: 14,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  modal: {
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: atomSpacing[5],
    maxWidth: 360,
    padding: atomSpacing[5],
    width: "100%"
  },
  trigger: {
    alignItems: "center",
    backgroundColor: atomPalette.surface,
    borderColor: atomPalette.border,
    borderRadius: atomControlRadius,
    borderWidth: 1,
    flexDirection: "row",
    gap: atomSpacing[3],
    minHeight: atomControlHeights.lg,
    paddingHorizontal: atomSpacing[4]
  },
  triggerError: { borderColor: atomPalette.error },
  webCursor: { cursor: "pointer" } as ViewStyle,
  weekday: {
    color: atomPalette.textMuted,
    flex: 1,
    textAlign: "center",
    textTransform: "uppercase"
  },
  weekdays: { flexDirection: "row" }
});
