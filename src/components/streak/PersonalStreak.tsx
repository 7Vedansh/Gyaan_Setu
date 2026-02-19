import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Flame } from "lucide-react-native";
import { useStreak } from "@/hooks/useStreak";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export function PersonalStreak() {
    const streakData = useStreak();

    return (
        <View style={styles.container}>
            {/* Current Streak Header */}
            <View style={styles.header}>
                <Flame size={48} color="#F97316" fill="#F97316" />
                <Text style={styles.streakCount}>{streakData.currentStreak}</Text>
                <Text style={styles.streakText}>Day Streak</Text>
            </View>

            {/* Calendar Mock */}
            <View style={styles.calendarContainer}>
                {DAYS.map((day, index) => {
                    const isActive = streakData.calendar?.[index]?.active;
                    return (
                        <View key={index} style={styles.dayColumn}>
                            <Text style={styles.dayText}>{day}</Text>
                            <View style={[styles.dayCircle, isActive && styles.dayActive]}>
                                {isActive && <Flame size={16} color="white" fill="white" />}
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Current Streak</Text>
                    <Text style={styles.statValue}>{streakData.currentStreak}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Longest Streak</Text>
                    <Text style={styles.statValue}>{streakData.longestStreak}</Text>
                </View>
            </View>

            {/* Goal Progress */}
            <View style={styles.goalContainer}>
                <View style={styles.goalHeader}>
                    <Text style={styles.goalLabel}>Streak Goal: {streakData.goal}</Text>
                    <Text style={styles.goalValue}>
                        {Math.round((streakData.currentStreak / streakData.goal) * 100)}%
                    </Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            { width: `${(streakData.currentStreak / streakData.goal) * 100}%` },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    streakCount: {
        fontSize: 48,
        fontWeight: "bold",
        color: "white",
        marginTop: 8,
    },
    streakText: {
        fontSize: 18,
        color: "#94A3B8",
        fontWeight: "600",
    },
    calendarContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 32,
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#334155",
    },
    dayColumn: {
        alignItems: "center",
        gap: 8,
    },
    dayText: {
        color: "#94A3B8",
        fontWeight: "bold",
        fontSize: 12,
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#334155",
        alignItems: "center",
        justifyContent: "center",
    },
    dayActive: {
        backgroundColor: "#F97316",
    },
    statsGrid: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 32,
        width: "100%",
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#334155",
        alignItems: "center",
    },
    statLabel: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 4,
    },
    statValue: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
    },
    goalContainer: {
        width: "100%",
    },
    goalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    goalLabel: {
        color: "white",
        fontWeight: "bold",
    },
    goalValue: {
        color: "#F97316",
        fontWeight: "bold",
    },
    progressBarBg: {
        height: 12,
        backgroundColor: "#334155",
        borderRadius: 6,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#F97316",
        borderRadius: 6,
    },
});
