import { ProfileIcon, ProjectsIcon, ToDoIcon } from "@/components/icons";
import { getMonoFontStyle } from "@/theme/fonts";
import { designTokens } from "@/theme/tokens";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  const tabLabelToken = designTokens.typeScale.tabLabelMono;
  const tabIconSize = 20;
  const nativeLabelSize = 10;
  const nativeLetterSpacing = 0.35;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: designTokens.colors.semantic.text.accent,
        tabBarInactiveTintColor: designTokens.colors.semantic.text.muted,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: designTokens.colors.semantic.bg.canvas,
          borderTopColor: designTokens.colors.semantic.border.subtle
        },
        tabBarItemStyle: {
          gap: 2,
          minWidth: 0,
          paddingTop: 6
        },
        tabBarIconStyle: {
          marginBottom: 0
        },
        tabBarLabelStyle: {
          fontSize:
            Platform.OS === "web" ? tabLabelToken.fontSize : nativeLabelSize,
          lineHeight: 14,
          letterSpacing:
            Platform.OS === "web"
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
          tabBarIcon: ({ color, size }) => (
            <ProjectsIcon color={color} size={Math.min(size, tabIconSize)} />
          )
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <ToDoIcon color={color} size={Math.min(size, tabIconSize)} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon color={color} size={Math.min(size, tabIconSize)} />
          )
        }}
      />
    </Tabs>
  );
}
