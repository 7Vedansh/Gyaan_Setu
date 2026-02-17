import { Text, View } from "@/components/themed";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { quizData } from "@/content/courses/data/quizzes/data";
import { Quiz } from "@/types/course";
import QuizService from "@/services/quiz.service";
import SyncService from "@/services/sync.service";

import { theme } from "@/theme/theme";

export default function Quizzes(): JSX.Element {
    const router = useRouter();
    const [storedResults, setStoredResults] = useState<{ id: number; quiz_id: number; score: number; total_questions: number; created_at: number }[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const refreshStoredResults = useCallback(() => {
        QuizService.getQuizResults()
            .then((rows) => setStoredResults(rows.slice(0, 10)))
            .catch(() => setStoredResults([]));
    }, []);

    useFocusEffect(
        useCallback(() => {
            refreshStoredResults();
        }, [refreshStoredResults])
    );

    const handleSync = useCallback(async () => {
        setSyncing(true);
        setSyncMessage(null);
        try {
            await SyncService.performSync(true);
            setSyncMessage({ type: "success", text: "Sync complete" });
            refreshStoredResults();
        } catch (err) {
            let text = err instanceof Error ? err.message : "Sync failed";
            if (text === "Network request failed" || text.includes("Network request failed")) {
                text = "Cannot reach server. Set EXPO_PUBLIC_API_URL in .env and ensure the backend is running.";
            }
            setSyncMessage({ type: "error", text });
        } finally {
            setSyncing(false);
        }
    }, [refreshStoredResults]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.syncSection}>
                <Button
                    label={syncing ? "Syncing…" : "Sync with cloud"}
                    onPress={handleSync}
                    disabled={syncing}
                    loading={syncing}
                    variant="secondary"
                    style={styles.syncButton}
                />
                {syncMessage && (
                    <Text style={syncMessage.type === "success" ? styles.syncSuccess : styles.syncError}>
                        {syncMessage.text}
                    </Text>
                )}
            </View>
            <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Stored quiz results (from DB)</Text>
                {storedResults.length === 0 ? (
                    <Text style={styles.resultsEmpty}>No results yet. Complete a quiz to see them here.</Text>
                ) : (
                    storedResults.map((r) => (
                        <Text key={r.id} style={styles.resultRow}>
                            Quiz #{r.quiz_id} — {r.score}/{r.total_questions} — {new Date(r.created_at).toLocaleString()}
                        </Text>
                    ))
                )}
            </View>
            {quizData.map((quiz: Quiz) => (
                <TouchableOpacity
                    key={quiz.id}
                    onPress={() => router.push(`/quiz/${quiz.id}`)}
                >
                    <Card style={styles.card} variant="elevated">
                        <Text style={styles.title}>{quiz.title}</Text>
                        <Text style={styles.description}>{quiz.description}</Text>
                        <Text style={styles.subject}>{quiz.subject}</Text>
                    </Card>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.colors.background,
    },
    card: {
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
        color: theme.colors.text.primary,
    },
    description: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    subject: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    resultsSection: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    resultsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: theme.colors.text.primary,
    },
    resultsEmpty: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    resultRow: {
        fontSize: 12,
        color: theme.colors.text.primary,
        marginBottom: 4,
    },
    syncSection: {
        marginBottom: 16,
    },
    syncButton: {
        marginBottom: 8,
    },
    syncSuccess: {
        fontSize: 12,
        color: theme.colors.status.success,
    },
    syncError: {
        fontSize: 12,
        color: theme.colors.status.error,
    },
});