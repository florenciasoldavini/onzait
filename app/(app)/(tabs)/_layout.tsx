import { HomeIcon, ProfileIcon, ToDoIcon } from "@/components/icons";
import { getSansFontStyle } from "@/theme/fonts";
import { designTokens } from "@/theme/tokens";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: designTokens.colors.semantic.text.primary,
        tabBarInactiveTintColor: designTokens.colors.semantic.text.muted,
        tabBarStyle: {
          backgroundColor: designTokens.colors.semantic.bg.canvas,
          borderTopColor: designTokens.colors.semantic.border.subtle,
          height: designTokens.spacing[16],
          paddingBottom: designTokens.spacing[2],
          paddingTop: designTokens.spacing[2]
        },
        tabBarLabelStyle: {
          fontSize: designTokens.typeScale.tabLabel.fontSize,
          lineHeight: designTokens.typeScale.tabLabel.lineHeight,
          ...getSansFontStyle(designTokens.typeScale.tabLabel.fontWeight)
        }
      }}
    >
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size }) => (
            <ToDoIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Preview",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon color={color} size={size} />
          )
        }}
      />
    </Tabs>
  );
}
