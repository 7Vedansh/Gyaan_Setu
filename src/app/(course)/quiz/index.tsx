import { Text, View } from "@/components/themed";
import { Card } from "@/components/ui/Card";
import { StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { quizData } from "@/content/courses/data/quizzes/data";
import { Quiz } from "@/types/course";
import QuizService from "@/services/quiz.service";

export default function Quizzes(): JSX.Element {
    const router = useRouter();
    const [storedResults, setStoredResults] = useState<{ id: number; quiz_id: number; score: number; total_questions: number; created_at: number }[]>([]);

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;
            QuizService.getQuizResults()
                .then((rows) => { if (!cancelled) setStoredResults(rows.slice(0, 10)); })
                .catch(() => { if (!cancelled) setStoredResults([]); });
            return () => { cancelled = true; };
        }, [])
    );

    return (
        <ScrollView style={styles.container}>
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
        backgroundColor: "#f5f5f5",
    },
    card: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    subject: {
        fontSize: 12,
        color: "#999",
    },
    resultsSection: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: "#e8f4f8",
        borderRadius: 8,
    },
    resultsTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
    },
    resultsEmpty: {
        fontSize: 12,
        color: "#666",
    },
    resultRow: {
        fontSize: 12,
        color: "#333",
        marginBottom: 4,
    },
});