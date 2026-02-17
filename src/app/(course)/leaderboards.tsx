import React, { useMemo } from "react";
import { theme } from "@/theme/theme";
import {
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import { View, Text } from "@/components/themed";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
}

const CURRENT_USER_ID = "3"; // change based on auth later

export default function Leaderboards() {
  const users: LeaderboardUser[] = [
    {
      id: "1",
      name: "Laxminarayan",
      avatar: "https://i.pravatar.cc/150?img=1",
      xp: 14,
    },
    {
      id: "2",
      name: "Ameya",
      avatar: "https://i.pravatar.cc/150?img=2",
      xp: 13,
    },
    {
      id: "3",
      name: "Vedansh Rathi",
      avatar: "https://i.pravatar.cc/150?img=3",
      xp: 5,
    },
  ];

  const rankedUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => b.xp - a.xp)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
  }, []);

  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank.toString();
  };

  const renderItem = ({ item }: any) => {
    const isCurrent = item.id === CURRENT_USER_ID;

    return (
      <View style={[styles.row, isCurrent && styles.currentUser]}>
        <Text style={styles.rank}>{getMedal(item.rank)}</Text>

        <Image source={{ uri: item.avatar }} style={styles.avatar} />

        <Text style={[styles.name, isCurrent && styles.currentHighlight]}>
          {item.name}
        </Text>

        <Text style={[styles.xp, isCurrent && styles.currentHighlight]}>
          {item.xp} XP
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.leagueTitle}>Sapphire League</Text>
          <Text style={styles.subtitle}>
            Top 8 advance to the next league
          </Text>
          <Text style={styles.timer}>5 days</Text>
        </View>

        {/* Leaderboard List */}
        <FlatList
          data={rankedUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

// Helper to convert hex to rgba
const hexToRgba = (hex: string, opacity: number) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
    : hex;
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    marginVertical: 24,
  },
  leagueTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    opacity: 0.8,
    color: theme.colors.text.secondary,
  },
  timer: {
    marginTop: 6,
    fontWeight: "600",
    color: theme.colors.secondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currentUser: {
    backgroundColor: hexToRgba(theme.colors.primary, 0.15),
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  rank: {
    width: 40,
    fontSize: 18,
    textAlign: "center",
    color: theme.colors.text.primary,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  name: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  xp: {
    fontWeight: "bold",
    color: theme.colors.text.secondary,
  },
  currentHighlight: {
    color: theme.colors.primary,
  },
});
