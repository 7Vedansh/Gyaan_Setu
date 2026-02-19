import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Flame, Plus, UserPlus } from "lucide-react-native";
import { useFriendsStreak } from "@/hooks/useFriendsStreak";
import { FriendStreak } from "@/services/streak.service";

export function FriendsStreak() {
    const friends = useFriendsStreak();

    const renderItem = ({ item }: { item: FriendStreak }) => {
        if (item.invite) {
            return (
                <View style={styles.row}>
                    <View style={[styles.avatar, styles.inviteAvatar]}>
                        <Plus size={20} color="#94A3B8" />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.inviteName}>{item.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.inviteButton}>
                        <UserPlus size={16} color="white" style={{ marginRight: 4 }} />
                        <Text style={styles.inviteButtonText}>INVITE</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.row}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.streakInfo}>
                        <Flame size={14} color="#F97316" fill="#F97316" />
                        <Text style={styles.streakCount}>{item.streak}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.nudgeButton}>
                    <Text style={styles.nudgeText}>NUDGE</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={friends}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    listContent: {
        gap: 16,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E293B",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#334155",
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#334155",
        marginRight: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    inviteAvatar: {
        borderWidth: 2,
        borderColor: "#475569",
        borderStyle: "dashed",
        backgroundColor: "transparent",
    },
    info: {
        flex: 1,
    },
    name: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 2,
    },
    inviteName: {
        color: "#94A3B8",
        fontWeight: "600",
        fontSize: 16,
    },
    streakInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    streakCount: {
        color: "#F97316",
        fontWeight: "bold",
        fontSize: 14,
    },
    nudgeButton: {
        backgroundColor: "#334155",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    nudgeText: {
        color: "#94A3B8",
        fontWeight: "700",
        fontSize: 12,
    },
    inviteButton: {
        backgroundColor: "#F97316",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    inviteButtonText: {
        color: "white",
        fontWeight: "700",
        fontSize: 12,
    },
});
