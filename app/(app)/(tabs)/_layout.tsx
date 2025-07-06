import { HomeIcon, ProfileIcon, ToDoIcon } from "@/components/icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93"
      }}
    >
      <Tabs.Screen
        name="to-do"
        options={{
          title: "To-Do",
          tabBarIcon: ({ color, size }) => (
            <ToDoIcon color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Projects",
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
