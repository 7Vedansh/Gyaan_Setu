import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { theme } from "@/theme/theme";
import { Leaderboard } from "@/components/streak/Leaderboard";
import { View, Text } from "@/components/themed";

export default function LeaderboardsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Leagues</Text>
      </View>
      <View style={styles.container}>
        <Leaderboard />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.heading,
    fontWeight: "900",
    color: theme.colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  container: {
    flex: 1,
  },
});
