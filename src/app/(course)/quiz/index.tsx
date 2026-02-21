import { Text, View } from "@/components/themed";
import { Icon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
    getQuizzesByTopic,
    getTopicsByChapter,
    type TopicResponse,
    type QuizResponse,
} from "@/services/microLesson.service";
import QuizService from "@/services/quiz.service";
import SyncService from "@/services/sync.service";
import { getChapter } from "@/services/course.service";
import { useCourse } from "@/context/course";
import { QuizResult } from "@/types/store";

import { theme } from "@/theme/theme";

export default function Quizzes(): JSX.Element {
    const router = useRouter();
    const { courseProgress } = useCourse();

    // ── Backend data ────────────────────────────────────────────────────
    const [topics, setTopics] = useState<TopicResponse[]>([]);
    const [quizCountByTopic, setQuizCountByTopic] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // ── Stored results (local SQLite) ───────────────────────────────────
    const [storedResults, setStoredResults] = useState<QuizResult[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // ── Fetch topics + quiz counts from backend ─────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            setIsLoading(true);
            setFetchError(null);

            try {
                // Get the real chapter ID from the course structure
                const chapter = getChapter(courseProgress.sectionId, courseProgress.chapterId);
                const chapterId = chapter?._id;

                if (!chapterId) {
                    setIsLoading(false);
                    return;
                }

                const fetchedTopics = await getTopicsByChapter(chapterId);
                if (cancelled) return;

                setTopics(fetchedTopics);

                // Fetch quiz counts for each topic (in parallel)
                const counts: Record<string, number> = {};
                await Promise.all(
                    fetchedTopics.map(async (topic) => {
                        try {
                            const quizzes = await getQuizzesByTopic(topic._id);
                            counts[topic._id] = quizzes.length;
                        } catch {
                            counts[topic._id] = 0;
                        }
                    })
                );

                if (cancelled) return;
                setQuizCountByTopic(counts);
            } catch (err) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Failed to load quizzes";
                setFetchError(message);
                console.error("[Quizzes] Fetch error:", err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, []);

    // ── Refresh stored results ──────────────────────────────────────────
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

    // ── Sync ────────────────────────────────────────────────────────────
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

    // ── Render ──────────────────────────────────────────────────────────

    return (
        <ScrollView style={styles.container}>
            {/* Sync section */}
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

            {/* Stored results section */}
            <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Stored quiz results (from DB)</Text>
                {storedResults.length === 0 ? (
                    <Text style={styles.resultsEmpty}>No results yet. Complete a quiz to see them here.</Text>
                ) : (
                    storedResults.map((r) => (
                        <Text key={r.id} style={styles.resultRow}>
                            Quiz #{r.quiz_id} — {r.is_correct === 1 ? "Correct" : "Incorrect"} — {new Date(r.attempted_at).toLocaleString()}
                        </Text>
                    ))
                )}
            </View>

            {/* Loading */}
            {isLoading && (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading quizzes…</Text>
                </View>
            )}

            {/* Error */}
            {!isLoading && fetchError && (
                <View style={styles.errorSection}>
                    <Icon name="closeCircle" size={36} color={theme.colors.status.error} />
                    <Text style={styles.errorText}>{fetchError}</Text>
                    <Text style={styles.errorHint}>
                        Make sure the backend is running and the quiz routes are set up.
                    </Text>
                </View>
            )}

            {/* No quizzes */}
            {!isLoading && !fetchError && topics.length === 0 && (
                <View style={styles.emptySection}>
                    <Icon name="notebook" size={48} color={theme.colors.text.secondary} />
                    <Text style={styles.emptyText}>No quizzes available yet.</Text>
                    <Text style={styles.emptyHint}>
                        Quizzes will appear here once content is added to the backend.
                    </Text>
                </View>
            )}

            {/* Topic quiz cards */}
            {!isLoading &&
                topics.map((topic) => (
                    <TouchableOpacity
                        key={topic._id}
                        onPress={() => router.push(`/quiz/${topic._id}`)}
                    >
                        <Card style={styles.card} variant="elevated">
                            <View style={styles.cardHeader}>
                                <View style={styles.topicBadge}>
                                    <Text style={styles.topicBadgeText}>
                                        Topic {topic.topic_number}
                                    </Text>
                                </View>
                                <Text style={styles.questionCount}>
                                    {quizCountByTopic[topic._id] ?? 0} questions
                                </Text>
                            </View>
                            <Text style={styles.title}>Topic {topic.topic_number} Quiz</Text>
                            <Text style={styles.description}>
                                Test your knowledge on this topic
                            </Text>
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
    centered: {
        alignItems: "center",
        paddingVertical: 32,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: 12,
    },
    errorSection: {
        alignItems: "center",
        paddingVertical: 24,
        gap: 8,
    },
    errorText: {
        fontSize: 14,
        color: theme.colors.status.error,
        textAlign: "center",
    },
    errorHint: {
        fontSize: 12,
        color: theme.colors.text.secondary,
        textAlign: "center",
    },
    emptySection: {
        alignItems: "center",
        paddingVertical: 32,
        gap: 8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.text.primary,
    },
    emptyHint: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        textAlign: "center",
    },
    card: {
        marginBottom: 16,
        backgroundColor: theme.colors.surface,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    topicBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: theme.radius.round,
    },
    topicBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: theme.colors.primaryForeground,
        textTransform: "uppercase",
    },
    questionCount: {
        fontSize: 12,
        color: theme.colors.text.secondary,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
        color: theme.colors.text.primary,
    },
    description: {
        fontSize: 14,
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
