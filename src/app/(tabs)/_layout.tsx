import React from "react";
import { Tabs } from "expo-router";
import { BookOpen, Bot, User } from "lucide-react-native";
import { theme } from "@/theme/theme";
import { View } from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    ...theme.shadows.lg,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.text.secondary,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontFamily: theme.typography.fontFamily.body,
                    fontSize: 12,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Learn",
                    tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="tutor"
                options={{
                    title: "AI Tutor",
                    tabBarIcon: ({ color, size }) => (
                        <View
                            style={{
                                backgroundColor: theme.colors.secondary,
                                borderRadius: 20,
                                padding: 4,
                                marginBottom: 4,
                            }}
                        >
                            <Bot color={theme.colors.text.primary} size={24} />
                        </View>
                    ),
                    tabBarActiveTintColor: theme.colors.secondary,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
