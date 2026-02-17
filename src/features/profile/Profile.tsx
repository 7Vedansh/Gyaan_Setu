import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, LogOut } from "lucide-react-native";

export const Profile = () => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <User size={64} color={theme.colors.primary} />
                </View>
                <Text variant="h2" style={{ marginTop: 16 }}>
                    Explorer Vedan
                </Text>
                <Text variant="body" color={theme.colors.text.secondary}>
                    Level 5 • 1200 XP
                </Text>
            </View>

            <Card style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Text variant="h3">🔥 7</Text>
                    <Text variant="caption">Day Streak</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.statItem}>
                    <Text variant="h3">📚 12</Text>
                    <Text variant="caption">Lessons</Text>
                </View>
                <View style={styles.separator} />
                <View style={styles.statItem}>
                    <Text variant="h3">⭐ 45</Text>
                    <Text variant="caption">Stars</Text>
                </View>
            </Card>

            <View style={styles.actions}>
                <Button
                    label="Edit Profile"
                    variant="outline"
                    onPress={() => { }}
                    style={{ marginBottom: 12 }}
                />
                <Button
                    label="Settings"
                    variant="secondary"
                    onPress={() => { }}
                    style={{ marginBottom: 12 }}
                />
                <Button
                    label="Log Out"
                    variant="danger"
                    onPress={() => { }}
                    leftIcon={<LogOut size={16} color={theme.colors.text.primary} />}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xxxl,
        flexGrow: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: "center",
        marginBottom: theme.spacing.xl,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
        justifyContent: "center",
        ...theme.shadows.md,
    },
    statsCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
    },
    separator: {
        width: 1,
        backgroundColor: theme.colors.border,
    },
    actions: {
        gap: theme.spacing.sm,
    },
});
