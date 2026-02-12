import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { router } from "expo-router";

export const Dashboard = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text variant="h1" color={theme.colors.primary} style={{ marginBottom: 4 }}>
                    Hello, Explorer!
                </Text>
                <Text variant="body" color={theme.colors.text.secondary}>
                    Ready for today's adventure?
                </Text>
            </View>

            <Card variant="elevated" style={styles.mainCard} animate={true}>
                <View style={styles.cardContent}>
                    <Text variant="h2" style={{ marginBottom: 8 }}>
                        Current Mission
                    </Text>
                    <Text variant="body" style={{ marginBottom: 16 }}>
                        Module 1: Galaxy Basics
                    </Text>
                    <Button
                        label="Continue Learning"
                        onPress={() => router.push("/learn")}
                        variant="primary"
                        size="lg"
                        rightIcon={<Text style={{ fontSize: 20 }}>🚀</Text>}
                    />
                </View>
            </Card>

            <Text variant="h3" style={styles.sectionTitle}>
                Your Achievements
            </Text>

            <View style={styles.achievements}>
                <Card variant="flat" padding="sm" style={styles.badge}>
                    <Text style={{ fontSize: 32 }}>⭐</Text>
                    <Text variant="caption">Star Explorer</Text>
                </Card>
                <Card variant="flat" padding="sm" style={styles.badge}>
                    <Text style={{ fontSize: 32 }}>🔥</Text>
                    <Text variant="caption">7 Day Streak</Text>
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xxxl,
        backgroundColor: theme.colors.background,
        flexGrow: 1,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    mainCard: {
        marginBottom: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
    },
    cardContent: {
        alignItems: "center",
    },
    sectionTitle: {
        marginBottom: theme.spacing.md,
    },
    achievements: {
        flexDirection: "row",
        gap: theme.spacing.md,
    },
    badge: {
        alignItems: "center",
        justifyContent: "center",
        width: 100,
        height: 100,
    },
});
