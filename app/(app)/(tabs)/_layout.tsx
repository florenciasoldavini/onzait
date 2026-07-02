import { ProfileIcon, ProjectsIcon, ToDoIcon } from "@/components/icons";
import { getMonoFontStyle } from "@/theme/fonts";
import { designTokens } from "@/theme/tokens";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useState } from "react";
import { Platform, Pressable, Text, View, type ViewStyle } from "react-native";

export default function TabsLayout() {
  const tabLabelToken = designTokens.typeScale.tabLabelMono;
  const tabIconSize = 20;

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
      tabBar={(props) => <OnzaitTabBar {...props} />}
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

function OnzaitTabBar({ descriptors, navigation, state }: BottomTabBarProps) {
  const [hoveredRouteKey, setHoveredRouteKey] = useState<string | null>(null);
  const tabLabelToken = designTokens.typeScale.tabLabelMono;
  const tabIconSize = 20;

  return (
    <View
      style={{
        backgroundColor: designTokens.colors.semantic.bg.canvas,
        borderTopColor: designTokens.colors.semantic.border.subtle,
        borderTopWidth: 1,
        flexDirection: "row",
        height: 76,
        paddingBottom: 6,
        paddingTop: 6
      }}
    >
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        const options = descriptor.options;
        const isFocused = state.index === index;
        const isHovered = hoveredRouteKey === route.key;
        const color = getTabItemColor({ isFocused, isHovered });
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const onPress = () => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: "tabPress"
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            target: route.key,
            type: "tabLongPress"
          });
        };

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            key={route.key}
            onLongPress={onLongPress}
            onPointerEnter={() => {
              setHoveredRouteKey(route.key);
            }}
            onPointerLeave={() => {
              setHoveredRouteKey((current) =>
                current === route.key ? null : current
              );
            }}
            onPress={onPress}
            style={({ pressed }) =>
              [
                {
                  alignItems: "center",
                  flex: 1,
                  gap: 2,
                  justifyContent: "center",
                  opacity: pressed ? 0.86 : 1,
                  paddingVertical: 2
                },
                Platform.OS === "web"
                  ? ({
                      cursor: "pointer"
                    } as ViewStyle)
                  : null
              ] as ViewStyle[]
            }
          >
            {options.tabBarIcon
              ? options.tabBarIcon({
                  color,
                  focused: isFocused,
                  size: tabIconSize
                })
              : null}
            <Text
              style={{
                color,
                fontSize: tabLabelToken.fontSize,
                letterSpacing: tabLabelToken.letterSpacing,
                lineHeight: 14,
                textTransform: tabLabelToken.textTransform,
                ...getMonoFontStyle(tabLabelToken.fontWeight)
              }}
            >
              {typeof label === "string" ? label : route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function getTabItemColor({
  isFocused,
  isHovered
}: {
  isFocused: boolean;
  isHovered: boolean;
}) {
  if (isFocused) {
    return designTokens.colors.semantic.text.accent;
  }

  if (isHovered) {
    return designTokens.colors.semantic.text.secondary;
  }

  return designTokens.colors.semantic.text.muted;
}
