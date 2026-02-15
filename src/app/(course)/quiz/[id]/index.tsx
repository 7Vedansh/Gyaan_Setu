import { Text, View } from "@/components/themed";
import { StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { quizData } from "@/content/courses/data/quizzes/data";
import { Quiz } from "@/types/course";

export default function QuizDetails(): JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();
    const parsedId = id ? parseInt(id, 10) : null;
    const quiz = parsedId ? quizData.find((q) => q.id === parsedId) : null;

    if (!quiz) {
        return (
            <View style={styles.container}>
                <Text style={styles.error}>Quiz not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{quiz.title}</Text>
            <Text style={styles.description}>{quiz.description}</Text>
            <View style={styles.questionsContainer}>
                {quiz.questions.map((q, index) => (
                    <View key={index} style={styles.questionCard}>
                        <Text style={styles.question}>{q.question}</Text>
                        {q.options.map((option, idx) => (
                            <Text key={idx} style={styles.option}>{`- ${option}`}</Text>
                        ))}
                    </View>
                ))}
            </View>
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
    option: {
        fontSize: 14,
        color: "#333",
    },
    error: {
        fontSize: 18,
        color: "red",
        textAlign: "center",
    },
});
