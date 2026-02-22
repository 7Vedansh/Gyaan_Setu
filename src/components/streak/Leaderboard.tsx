import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Flame, Trophy, Medal } from "lucide-react-native";
import { theme } from "@/theme/theme";
import { MotiView } from "moti";

interface League {
    id: string;
    name: string;
    description: string;
    colors: [string, string, ...string[]];
    icon: string;
}

const LEAGUES: League[] = [
    {
        id: "bronze",
        name: "Bronze",
        description: "The journey begins here!",
        colors: ["#CD7F32", "#A0522D"],
        icon: "🥉",
    },
    {
        id: "silver",
        name: "Silver",
        description: "Keep climbing the ranks!",
        colors: ["#C0C0C0", "#708090"],
        icon: "🥈",
    },
    {
        id: "gold",
        name: "Gold",
        description: "You're getting serious now!",
        colors: ["#FFD700", "#DAA520"],
        icon: "🥇",
    },
    {
        id: "sapphire",
        name: "Sapphire",
        description: "Only the dedicated reach sapphire.",
        colors: ["#0F52BA", "#082567"],
        icon: "💎",
    },
    {
        id: "ruby",
        name: "Ruby",
        description: "The elite circle of learners.",
        colors: ["#E0115F", "#800020"],
        icon: "🌹",
    },
];

interface LeaderboardUser {
    id: string;
    name: string;
    avatar: string;
    streak: number;
    points: number;
    isCurrentUser?: boolean;
}

const MOCK_USERS: Record<string, LeaderboardUser[]> = {
    bronze: [
        { id: "1", name: "Rahul S.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul", streak: 5, points: 450 },
        { id: "2", name: "Priya M.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", streak: 3, points: 420 },
        { id: "me", name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User", streak: 4, points: 380, isCurrentUser: true },
        { id: "3", name: "Amit K.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit", streak: 2, points: 310 },
    ],
    silver: [
        { id: "4", name: "Sneha P.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha", streak: 12, points: 1250 },
        { id: "5", name: "Vikram R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram", streak: 15, points: 1100 },
        { id: "6", name: "Anjali D.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali", streak: 8, points: 950 },
    ],
    gold: [
        { id: "7", name: "Arjun G.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun", streak: 25, points: 3400 },
        { id: "8", name: "Deepa H.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepa", streak: 30, points: 3100 },
    ],
    sapphire: [
        { id: "9", name: "Rohan V.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan", streak: 45, points: 7800 },
    ],
    ruby: [
        { id: "10", name: "Kavita J.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita", streak: 100, points: 15000 },
    ],
};

export function Leaderboard() {
    const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);

    const renderUser = ({ item, index }: { item: LeaderboardUser; index: number }) => (
        <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: index * 100 }}
            style={[styles.userRow, item.isCurrentUser && styles.currentUserRow]}
        >
            <View style={styles.rankContainer}>
                <Text style={[styles.rankText, index < 3 && styles.topRankText]}>
                    {index + 1}
                </Text>
            </View>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <Text style={[styles.userName, item.isCurrentUser && styles.currentUserName]}>
                    {item.name}
                </Text>
                <Text style={styles.userPoints}>{item.points} XP</Text>
            </View>
            <View style={styles.streakContainer}>
                <Flame size={16} color={theme.colors.status.warning} fill={theme.colors.status.warning} />
                <Text style={styles.streakText}>{item.streak}</Text>
            </View>
        </MotiView>
    );

    return (
        <View style={styles.container}>
            {/* League Selector */}
            <View style={styles.leagueSelectorContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.leagueSelectorScroll}
                >
                    {LEAGUES.map((league) => (
                        <TouchableOpacity
                            key={league.id}
                            onPress={() => setSelectedLeague(league)}
                            style={styles.leagueTab}
                        >
                            <LinearGradient
                                colors={selectedLeague.id === league.id ? league.colors : ["#334155", "#1E293B"]}
                                style={[
                                    styles.leagueIconContainer,
                                    selectedLeague.id === league.id && styles.activeLeagueIcon,
                                ]}
                            >
                                <Text style={styles.leagueIconEmoji}>{league.icon}</Text>
                            </LinearGradient>
                            <Text style={[
                                styles.leagueTabText,
                                selectedLeague.id === league.id && { color: league.colors[0], fontWeight: "800" }
                            ]}>
                                {league.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* League Banner */}
            <MotiView
                key={selectedLeague.id}
                from={{ opacity: 0, scale: 0.9, translateY: 10 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{ type: "spring", damping: 12 }}
            >
                <LinearGradient
                    colors={selectedLeague.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.leagueBanner}
                >
                    <View style={styles.leagueBannerContent}>
                        <MotiView
                            animate={{ rotate: ["0deg", "10deg", "0deg", "-10deg", "0deg"] }}
                            transition={{ loop: true, duration: 2000, type: "timing" }}
                        >
                            <Trophy color="rgba(255,255,255,0.9)" size={32} />
                        </MotiView>
                        <View style={styles.leagueBannerText}>
                            <Text style={styles.leagueBannerTitle}>{selectedLeague.name} League</Text>
                            <Text style={styles.leagueBannerSub}>{selectedLeague.description}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </MotiView>

            {/* Leaderboard List */}
            <FlatList
                data={MOCK_USERS[selectedLeague.id] || []}
                renderItem={renderUser}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No users in this league yet!</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    leagueSelectorContainer: {
        paddingVertical: 12,
        backgroundColor: "transparent",
    },
    leagueSelectorScroll: {
        paddingHorizontal: 16,
        gap: 20,
    },
    leagueTab: {
        alignItems: "center",
        gap: 6,
    },
    leagueIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
    },
    activeLeagueIcon: {
        borderColor: "white",
        transform: [{ scale: 1.1 }],
    },
    leagueIconEmoji: {
        fontSize: 24,
    },
    leagueTabText: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    leagueBanner: {
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...theme.shadows.md,
    },
    leagueBannerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    leagueBannerText: {
        flex: 1,
    },
    leagueBannerTitle: {
        color: "white",
        fontSize: 18,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    leagueBannerSub: {
        color: "rgba(255,255,255,0.8)",
        fontSize: 12,
        fontWeight: "600",
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
        gap: 8,
    },
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    currentUserRow: {
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        borderColor: theme.colors.primary,
        borderWidth: 2,
    },
    rankContainer: {
        width: 30,
        alignItems: "center",
    },
    rankText: {
        color: theme.colors.text.secondary,
        fontWeight: "900",
        fontSize: 16,
    },
    topRankText: {
        color: theme.colors.status.warning,
        fontSize: 18,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginHorizontal: 12,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    currentUserName: {
        color: theme.colors.primary,
    },
    userPoints: {
        color: theme.colors.text.secondary,
        fontSize: 12,
        fontWeight: "700",
    },
    streakContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    streakText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    emptyContainer: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        color: theme.colors.text.secondary,
        fontWeight: "600",
    },
});
