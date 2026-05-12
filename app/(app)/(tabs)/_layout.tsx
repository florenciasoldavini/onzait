import {
  ProfileIcon,
  ProjectsIcon,
  ToDoIcon
} from "@/components/icons";
import { getMonoFontStyle } from "@/theme/fonts";
import { designTokens } from "@/theme/tokens";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const tabLabelToken = designTokens.typeScale.tabLabelMono;
  const tabIconSize = 20;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: designTokens.colors.semantic.text.primary,
        tabBarInactiveTintColor: designTokens.colors.semantic.text.muted,
        tabBarLabelPosition: "below-icon",
        tabBarStyle: {
          backgroundColor: designTokens.colors.semantic.bg.canvas,
          borderTopColor: designTokens.colors.semantic.border.subtle,
          height: 76,
          paddingBottom: 6,
          paddingTop: 6
        },
        tabBarItemStyle: {
          gap: 2,
          paddingVertical: 2
        },
        tabBarIconStyle: {
          marginBottom: 0
        },
        tabBarLabelStyle: {
          fontSize: tabLabelToken.fontSize,
          lineHeight: 14,
          letterSpacing: tabLabelToken.letterSpacing,
          textTransform: tabLabelToken.textTransform,
          ...getMonoFontStyle(tabLabelToken.fontWeight)
        }
      }}
    >
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
