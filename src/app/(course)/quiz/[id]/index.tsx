import { Text, View } from "@/components/themed";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { StyleSheet, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useCallback, useEffect } from "react";
import {
    getQuizzesByTopic,
    type QuizResponse,
} from "@/services/microLesson.service";
import QuizService from "@/services/quiz.service";
import { QuizResultAnswer } from "@/types/store";
import { theme } from "@/theme/theme";

// Helper to convert hex to rgba
const hexToRgba = (hex: string, opacity: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})`
        : hex;
};

export default function QuizDetails(): JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();

    // ── Backend data ────────────────────────────────────────────────────
    const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // ── Quiz interaction ────────────────────────────────────────────────
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        total: number;
        answers: QuizResultAnswer[];
    } | null>(null);

    // ── Fetch quiz questions from backend ───────────────────────────────
    useEffect(() => {
        let cancelled = false;

        async function fetchData() {
            if (!id) return;

            setIsLoading(true);
            setFetchError(null);

            try {
                // `id` is the topicId from the listing page
                const fetchedQuizzes = await getQuizzesByTopic(id);
                if (cancelled) return;
                setQuizzes(fetchedQuizzes);
            } catch (err) {
                if (cancelled) return;
                const message = err instanceof Error ? err.message : "Failed to load quiz";
                setFetchError(message);
                console.error("[QuizDetails] Fetch error:", err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        fetchData();
        return () => { cancelled = true; };
    }, [id]);

    // ── Select an option ────────────────────────────────────────────────
    const selectOption = useCallback(
        (questionIndex: number, optionIndex: number) => {
            if (submitted) return;
            setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
        },
        [submitted]
    );

    const allAnswered =
        quizzes.length > 0 &&
        quizzes.every((_, i) => selectedAnswers[i] != null);

    // ── Submit quiz ─────────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        if (quizzes.length === 0 || !allAnswered || saving) return;

        setSaving(true);
        try {
            const answers: QuizResultAnswer[] = quizzes.map(
                (q: QuizResponse, index: number) => {
                    const selectedIdx = selectedAnswers[index];
                    const isCorrect = selectedIdx === q.correct;
                    return {
                        questionIndex: index,
                        selectedAnswer: q.options[selectedIdx] ?? "",
                        correct: isCorrect,
                    };
                }
            );
            const score = answers.filter((a) => a.correct).length;
            const total = quizzes.length;

            // Save locally using a hash of the topicId as a numeric quiz_id
            // so existing SQLite schema works without migration.
            const numericId = hashStringToInt(id ?? "0");
            await QuizService.saveQuizResult(numericId, score, total, answers);

            setResult({ score, total, answers });
            setSubmitted(true);
        } catch (err) {
            console.error("Failed to save quiz result:", err);
        } finally {
            setSaving(false);
        }
    }, [quizzes, allAnswered, saving, selectedAnswers, id]);

    // ── Try again ───────────────────────────────────────────────────────
    const handleTryAgain = useCallback(() => {
        setSelectedAnswers({});
        setSubmitted(false);
        setResult(null);
    }, []);

    // ── Loading ─────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading quiz…</Text>
            </View>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────
    if (fetchError) {
        return (
            <View style={styles.centered}>
                <Icon name="closeCircle" size={48} color={theme.colors.status.error} />
                <Text style={styles.errorText}>{fetchError}</Text>
            </View>
        );
    }

    // ── No questions ────────────────────────────────────────────────────
    if (quizzes.length === 0) {
        return (
            <View style={styles.centered}>
                <Icon name="notebook" size={48} color={theme.colors.text.secondary} />
                <Text style={styles.emptyText}>No questions found for this topic.</Text>
            </View>
        );
    }

    // ── Results screen ──────────────────────────────────────────────────
    if (submitted && result) {
        return (
            <ScrollView style={styles.container}>
                <Text style={styles.pageTitle}>Quiz Complete</Text>
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Quiz complete</Text>
                    <Text style={styles.resultScore}>
                        You scored {result.score} out of {result.total}
                    </Text>
                    <Text style={styles.resultPercent}>
                        {result.total > 0
                            ? Math.round((result.score / result.total) * 100)
                            : 0}
                        %
                    </Text>
                </View>
                <View style={styles.questionsContainer}>
                    {quizzes.map((q, index) => {
                        const answerInfo = result.answers[index];
                        const isCorrect = answerInfo?.correct ?? false;
                        return (
                            <View
                                key={q._id}
                                style={[
                                    styles.questionCard,
                                    {
                                        borderLeftWidth: 4,
                                        borderLeftColor: isCorrect
                                            ? theme.colors.status.success
                                            : theme.colors.status.error,
                                    },
                                ]}
                            >
                                <Text style={styles.question}>{q.question}</Text>
                                <Text style={styles.yourAnswer}>
                                    Your answer: {answerInfo?.selectedAnswer ?? "—"}
                                </Text>
                                {!isCorrect && (
                                    <Text style={styles.correctAnswer}>
                                        Correct: {q.options[q.correct]}
                                    </Text>
                                )}
                                {q.explanation && (
                                    <Text style={styles.explanation}>{q.explanation}</Text>
                                )}
                            </View>
                        );
                    })}
                </View>
                <Button
                    label="Try again"
                    onPress={handleTryAgain}
                    variant="outline"
                    style={styles.tryAgainButton}
                />
            </ScrollView>
        );
    }

    // ── Quiz questions ──────────────────────────────────────────────────
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.pageTitle}>Quiz</Text>
            <Text style={styles.pageDescription}>
                {quizzes.length} question{quizzes.length !== 1 ? "s" : ""}
            </Text>
            <View style={styles.questionsContainer}>
                {quizzes.map((q, index) => {
                    const selectedIdx = selectedAnswers[index];
                    return (
                        <View key={q._id} style={styles.questionCard}>
                            <Text style={styles.question}>
                                {index + 1}. {q.question}
                            </Text>
                            {q.options.map((option, optIdx) => {
                                const isSelected = selectedIdx === optIdx;
                                return (
                                    <Pressable
                                        key={optIdx}
                                        onPress={() => selectOption(index, optIdx)}
                                        style={[
                                            styles.optionRow,
                                            isSelected && styles.optionRowSelected,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.radioOuter,
                                                isSelected && styles.radioOuterSelected,
                                            ]}
                                        >
                                            {isSelected && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={styles.optionText}>{option}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    );
                })}
            </View>
            <Button
                label={saving ? "Submitting…" : "Submit quiz"}
                onPress={handleSubmit}
                disabled={!allAnswered || saving}
                loading={saving}
                style={styles.submitButton}
            />
        </ScrollView>
    );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Simple string → positive integer hash.
 * Used to convert MongoDB ObjectId strings into numeric quiz_ids
 * for the existing SQLite quiz_results table.
 */
function hashStringToInt(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        backgroundColor: theme.colors.background,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    errorText: {
        fontSize: 14,
        color: theme.colors.status.error,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "bold",
        color: theme.colors.text.primary,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4,
        color: theme.colors.text.primary,
    },
    pageDescription: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        marginBottom: 16,
    },
    questionsContainer: {
        marginTop: 16,
    },
    questionCard: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        ...theme.shadows.md,
    },
    question: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        color: theme.colors.text.primary,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 4,
        borderRadius: 8,
        backgroundColor: theme.colors.background,
    },
    optionRowSelected: {
        backgroundColor: hexToRgba(theme.colors.primary, 0.15),
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: theme.colors.text.secondary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    radioOuterSelected: {
        borderColor: theme.colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.primary,
    },
    optionText: {
        fontSize: 14,
        color: theme.colors.text.primary,
        flex: 1,
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 32,
    },
    resultCard: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: "center",
        ...theme.shadows.md,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
        color: theme.colors.text.primary,
    },
    resultScore: {
        fontSize: 22,
        fontWeight: "bold",
        color: theme.colors.primary,
        marginBottom: 4,
    },
    resultPercent: {
        fontSize: 16,
        color: theme.colors.text.secondary,
    },
    yourAnswer: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginTop: 4,
    },
    correctAnswer: {
        fontSize: 14,
        color: theme.colors.status.success,
        marginTop: 2,
    },
    explanation: {
        fontSize: 13,
        color: theme.colors.text.secondary,
        marginTop: 6,
        fontStyle: "italic",
    },
    tryAgainButton: {
        marginTop: 8,
        marginBottom: 32,
    },
});
