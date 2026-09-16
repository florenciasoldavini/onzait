import { AppText } from "@/shared/ui/components/text";
import { getSansFontStyle } from "@/shared/theme/fonts";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useProfileAvatarUrl } from "@/features/profile/hooks/use-profile-avatar";
import {
  atomLayout,
  atomPalette,
  atomRadii,
  atomSpacing
} from "@/shared/ui/components/theme";
import {
  HardHatIcon,
  ChevronRightIcon,
  ProfileIcon,
  ProjectsIcon,
  ToDoIcon,
  UserIcon,
  type AppIconComponent
} from "@/shared/ui/icons";
import { usePathname, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { WorkspaceSwitcher } from "@/features/workspaces/components/workspace-switcher";
import { useWorkspace } from "@/features/workspaces/hooks/use-workspace";

const sideNavigationBackground = atomPalette.surface;
const sideNavigationBorder = atomPalette.borderSubtle;
const sideNavigationMuted = atomPalette.textMuted;

const primaryDestinations = [
  { href: "/projects", icon: ProjectsIcon, labelKey: "projects" },
  { href: "/tasks", icon: ToDoIcon, labelKey: "tasks" },
  {
    activePrefixes: ["/clients", "/contractors"],
    href: "/directory",
    icon: UserIcon,
    labelKey: "directory"
  }
] as const;

const accountDestination = {
  href: "/profile",
  icon: ProfileIcon,
  labelKey: "profile"
} as const;

export function AdaptiveSideNavigation({ expanded }: { expanded: boolean }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation("features/localization");
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();
  const { data: profileAvatarUrl = null } = useProfileAvatarUrl(user?.avatar);

  return (
    <View
      accessibilityLabel={t(
        ($) => $["features/localization"].navigation.primaryNavigation
      )}
      accessibilityRole="tablist"
      style={{
        backgroundColor: sideNavigationBackground,
        borderRightColor: sideNavigationBorder,
        borderRightWidth: 1,
        paddingBottom: Math.max(insets.bottom, atomSpacing[4]),
        paddingHorizontal: expanded ? atomSpacing[4] : atomSpacing[2],
        paddingTop: Math.max(insets.top, atomSpacing[5]),
        width: expanded
          ? atomLayout.navigationSidebarWidth
          : atomLayout.navigationRailWidth
      }}
    >
      {!expanded ? (
        <View
          style={{
            alignItems: "center",
            gap: atomSpacing[3],
            minHeight: 52
          }}
        >
          <HardHatIcon color={atomPalette.accent} size="md" />
        </View>
      ) : null}

      <View style={{ paddingTop: expanded ? 0 : atomSpacing[4] }}>
        <WorkspaceSwitcher presentation={expanded ? "sidebar" : "default"} />
      </View>

      <View
        style={{
          gap: expanded ? atomSpacing[1] : atomSpacing[2],
          paddingTop: expanded ? atomSpacing[6] : atomSpacing[8]
        }}
      >
        {primaryDestinations.map((destination) => (
          <SideNavigationDestination
            destination={destination}
            expanded={expanded}
            key={destination.href}
          />
        ))}
      </View>

      <View
        style={{
          borderTopColor: sideNavigationBorder,
          borderTopWidth: 1,
          gap: atomSpacing[2],
          marginTop: "auto",
          paddingTop: atomSpacing[4]
        }}
      >
        {expanded && user ? (
          <SidebarProfileSummary
            avatarUrl={profileAvatarUrl}
            firstName={user.first_name}
            lastName={user.last_name}
            onPress={() => router.navigate("/profile" as never)}
            role={activeWorkspace?.role_code ?? "member"}
          />
        ) : (
          <SideNavigationDestination
            destination={accountDestination}
            expanded={expanded}
          />
        )}
      </View>
    </View>
  );
}

function SidebarProfileSummary({
  avatarUrl,
  firstName,
  lastName,
  onPress,
  role
}: {
  avatarUrl: string | null;
  firstName: string;
  lastName: string | null;
  onPress: () => void;
  role: "admin" | "member";
}) {
  const { t } = useTranslation("features/localization");
  const [isHovered, setIsHovered] = useState(false);
  const displayName = [firstName, lastName].filter(Boolean).join(" ");
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part?.trim().charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      accessibilityLabel={t(
        ($) => $["features/localization"].navigation.profile
      )}
      accessibilityRole="button"
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: resolveSideNavigationBackground({
          focused: false,
          hovered: isHovered
        }),
        borderRadius: atomRadii.md,
        flexDirection: "row",
        gap: atomSpacing[3],
        minHeight: 56,
        opacity: pressed ? 0.72 : 1,
        paddingHorizontal: atomSpacing[2],
        paddingVertical: atomSpacing[2]
      })}
    >
      {avatarUrl ? (
        <Image
          accessibilityLabel={displayName}
          accessibilityRole="image"
          accessible
          contentFit="cover"
          source={{ uri: avatarUrl }}
          style={{
            borderRadius: atomRadii.full,
            height: 40,
            width: 40
          }}
        />
      ) : (
        <View
          style={{
            alignItems: "center",
            backgroundColor: `${atomPalette.accent}12`,
            borderRadius: atomRadii.full,
            height: 40,
            justifyContent: "center",
            width: 40
          }}
        >
          <AppText tone="accent" variant="label">
            {initials}
          </AppText>
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText
          numberOfLines={1}
          style={getSansFontStyle("600")}
          variant="bodySm"
        >
          {displayName}
        </AppText>
        <AppText numberOfLines={1} tone="muted" variant="meta">
          {role === "admin"
            ? t(($) => $["features/localization"].navigation.administrator)
            : t(($) => $["features/localization"].navigation.accountMember)}
        </AppText>
      </View>
      <ChevronRightIcon color={sideNavigationMuted} size="sm" />
    </Pressable>
  );
}

function SideNavigationDestination({
  destination,
  expanded
}: {
  destination: {
    activePrefixes?: readonly string[];
    href: string;
    icon: AppIconComponent;
    labelKey: "directory" | "profile" | "projects" | "tasks";
  };
  expanded: boolean;
}) {
  const { t } = useTranslation("features/localization");
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const focused =
    pathname === destination.href ||
    pathname.startsWith(`${destination.href}/`) ||
    destination.activePrefixes?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  const color = focused ? atomPalette.accent : sideNavigationMuted;
  const Icon = destination.icon;
  const label = t(
    ($) => $["features/localization"].navigation[destination.labelKey]
  );

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPress={() => router.navigate(destination.href as never)}
      style={({ pressed }) => ({
        alignItems: "center",
        backgroundColor: resolveSideNavigationBackground({
          focused: Boolean(focused),
          hovered: isHovered
        }),
        borderRadius: atomRadii.md,
        flexDirection: expanded ? "row" : "column",
        gap: expanded ? atomSpacing[3] : atomSpacing[1],
        justifyContent: expanded ? "flex-start" : "center",
        minHeight: expanded ? 52 : 58,
        opacity: pressed ? 0.72 : 1,
        paddingHorizontal: expanded ? atomSpacing[4] : atomSpacing[2],
        paddingVertical: atomSpacing[2]
      })}
    >
      <Icon color={color} size="md" />
      <AppText
        numberOfLines={1}
        style={{
          color,
          flex: expanded ? 1 : undefined,
          fontSize: expanded ? undefined : 9,
          lineHeight: expanded ? undefined : 12
        }}
        variant={expanded ? "label" : "meta"}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function resolveSideNavigationBackground({
  focused,
  hovered
}: {
  focused: boolean;
  hovered: boolean;
}) {
  if (focused) {
    return `${atomPalette.accent}10`;
  }

  return hovered ? atomPalette.surfaceLow : "transparent";
}
