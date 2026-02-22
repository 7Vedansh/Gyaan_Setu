import React from "react";
import { Tabs } from "expo-router";
import { Home, Brain, Trophy, User } from "lucide-react-native";
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
                    height: 70,
                    paddingBottom: 12,
                    paddingTop: 8,
                    ...theme.shadows.md,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.secondary,
                tabBarLabelStyle: {
                    fontFamily: theme.typography.fontFamily.body,
                    fontSize: 12,
                    fontWeight: "700",
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
                                    ? hexToRgba(theme.colors.primary, 0.15)
                                    : "transparent",
                                padding: 8,
                                borderRadius: 16,
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
                    title: "Parth AI",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View
                            style={{
                                backgroundColor: focused
                                    ? hexToRgba(theme.colors.primary, 0.15)
                                    : "transparent",
                                padding: 8,
                                borderRadius: 16,
                            }}
                        >
                            <Brain color={color} size={focused ? size + 2 : size} />
                        </View>
                    ),
                }}
            />

            {/* Leaderboards */}
            <Tabs.Screen
                name="leaderboards"
                options={{
                    title: "Leaderboard",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View
                            style={{
                                backgroundColor: focused
                                    ? hexToRgba(theme.colors.primary, 0.15)
                                    : "transparent",
                                padding: 8,
                                borderRadius: 16,
                            }}
                        >
                            <Trophy color={color} size={focused ? size + 2 : size} />
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
                                    ? hexToRgba(theme.colors.primary, 0.15)
                                    : "transparent",
                                padding: 8,
                                borderRadius: 16,
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
