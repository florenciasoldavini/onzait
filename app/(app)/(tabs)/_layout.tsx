import { ProfileIcon, ProjectsIcon, ToDoIcon } from "@/components/icons";
import { getMonoFontStyle } from "@/theme/fonts";
import { designTokens } from "@/theme/tokens";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  const tabLabelToken = designTokens.typeScale.tabLabelMono;
  const tabIconSize = "md" as const;
  const nativeLabelSize = 10;
  const nativeLetterSpacing = 0.35;
  const nativeTabBarHeight = 78;
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: designTokens.colors.semantic.text.accent,
        tabBarInactiveTintColor: designTokens.colors.semantic.text.muted,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: designTokens.colors.semantic.bg.canvas,
          borderTopColor: designTokens.colors.semantic.border.subtle,
          height: isWeb ? 64 : nativeTabBarHeight,
          paddingBottom: isWeb ? 8 : 14,
          paddingTop: 6
        },
        tabBarItemStyle: {
          gap: 2,
          minWidth: 0,
          paddingTop: isWeb ? 0 : 2
        },
        tabBarIconStyle: {
          marginBottom: 0
        },
        tabBarLabelStyle: {
          fontSize: isWeb ? tabLabelToken.fontSize : nativeLabelSize,
          lineHeight: 14,
          letterSpacing: isWeb
            ? tabLabelToken.letterSpacing
            : nativeLetterSpacing,
          textTransform: tabLabelToken.textTransform,
          ...getMonoFontStyle(tabLabelToken.fontWeight)
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ color }) => (
            <ProjectsIcon color={color} size={tabIconSize} />
          )
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) => (
            <ToDoIcon color={color} size={tabIconSize} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color} size={tabIconSize} />
          )
        }}
      />
    </Tabs>
  );
}
