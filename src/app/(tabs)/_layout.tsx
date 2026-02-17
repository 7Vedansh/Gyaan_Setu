import React from "react";
import { Tabs } from "expo-router";
import { Home, Brain, User } from "lucide-react-native";
import { theme } from "@/theme/theme";
import { View } from "react-native";

// Helper to convert hex to rgba
const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
        : hex;
};

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                    ...theme.shadows.lg,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.secondary,
                tabBarLabelStyle: {
                    fontFamily: theme.typography.fontFamily.body,
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            {/* Learn */}
            <Tabs.Screen
                name="index"
                options={{
                    title: "Learn",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View
                            style={{
                                backgroundColor: focused
                                    ? hexToRgba(theme.colors.primary, 0.2)
                                    : "transparent",
                                padding: 8,
                                borderRadius: 20,
                            }}
                        >
                            <Home color={color} size={focused ? size + 2 : size} />
                        </View>
                    ),
                }}
            />

            {/* AI Tutor */}
            <Tabs.Screen
                name="tutor"
                options={{
                    title: "AI Tutor",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View
                            style={{
                                backgroundColor: focused
                                    ? hexToRgba(theme.colors.primary, 0.2)
                                    : "transparent",
                                padding: 8,
                                borderRadius: 20,
                            }}
                        >
                            <Brain color={color} size={focused ? size + 2 : size} />
                        </View>
                    ),
                }}
            />

            {/* Profile */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View
                            style={{
                                backgroundColor: focused
                                    ? hexToRgba(theme.colors.primary, 0.2)
                                    : "transparent",
                                padding: 8,
                                borderRadius: 20,
                            }}
                        >
                            <User color={color} size={focused ? size + 2 : size} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
