import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState, useCallback } from "react";
import { quizData } from "@/content/courses/data/quizzes/data";
import { Quiz, Question } from "@/types/course";
import QuizService from "@/services/quiz.service";
import { QuizResultAnswer } from "@/types/store";
import { theme } from "@/theme/theme";

export default function QuizDetails(): JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();
    const parsedId = id ? parseInt(id, 10) : null;
    const quiz = parsedId ? quizData.find((q) => q.id === parsedId) : null;

    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<{
        score: number;
        total: number;
        answers: QuizResultAnswer[];
    } | null>(null);

    const selectOption = useCallback((questionIndex: number, option: string) => {
        if (submitted) return;
        setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
    }, [submitted]);

    const allAnswered =
        quiz != null &&
        quiz.questions.length > 0 &&
        quiz.questions.every((_, i) => selectedAnswers[i] != null && selectedAnswers[i] !== "");

    const handleSubmit = useCallback(async () => {
        if (!quiz || !parsedId || !allAnswered || saving) return;

        setSaving(true);
        try {
            const answers: QuizResultAnswer[] = quiz.questions.map((q: Question, index: number) => {
                const selected = selectedAnswers[index];
                const correct = selected === q.answer;
                return {
                    questionIndex: index,
                    selectedAnswer: selected,
                    correct,
                };
            });
            const score = answers.filter((a) => a.correct).length;
            const total = quiz.questions.length;

            await QuizService.saveQuizResult(parsedId, score, total, answers);
            setResult({ score, total, answers });
            setSubmitted(true);
        } catch (err) {
            console.error("Failed to save quiz result:", err);
        } finally {
            setSaving(false);
        }
    }, [quiz, parsedId, allAnswered, saving, selectedAnswers]);

    const handleTryAgain = useCallback(() => {
        setSelectedAnswers({});
        setSubmitted(false);
        setResult(null);
    }, []);

    if (!quiz) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Quiz not found</Text>
            </View>
        );
    }

    if (submitted && result) {
        return (
            <ScrollView style={styles.container}>
                <Text style={styles.title}>{quiz.title}</Text>
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
                    {quiz.questions.map((q, index) => {
                        const answerInfo = result.answers[index];
                        const isCorrect = answerInfo?.correct ?? false;
                        return (
                            <View
                                key={index}
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
                                        Correct: {q.answer}
                                    </Text>
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

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{quiz.title}</Text>
            <Text style={styles.description}>{quiz.description}</Text>
            <View style={styles.questionsContainer}>
                {quiz.questions.map((q, index) => (
                    <View key={index} style={styles.questionCard}>
                        <Text style={styles.question}>
                            {index + 1}. {q.question}
                        </Text>
                        {q.options.map((option) => {
                            const isSelected = selectedAnswers[index] === option;
                            return (
                                <Pressable
                                    key={option}
                                    onPress={() => selectOption(index, option)}
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
                ))}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: "#666",
        marginBottom: 16,
    },
    questionsContainer: {
        marginTop: 16,
    },
    questionCard: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    question: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 4,
        borderRadius: 8,
        backgroundColor: "#f9f9f9",
    },
    optionRowSelected: {
        backgroundColor: theme.colors.primary + "15",
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: theme.colors.border,
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
        color: "#333",
        flex: 1,
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 32,
    },
    error: {
        fontSize: 18,
        color: "red",
        textAlign: "center",
    },
    resultCard: {
        backgroundColor: "#fff",
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
    tryAgainButton: {
        marginTop: 8,
        marginBottom: 32,
    },
});
