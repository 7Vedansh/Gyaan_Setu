import { Text, View } from "@/components/themed";
import { Card } from "@/components/ui/Card";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { quizData } from "@/content/courses/data/quizzes/data";
import { Quiz } from "@/types/course";

export default function Quizzes(): JSX.Element {
    const router = useRouter();

    return (
        <View style={styles.container}>
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
        </View>
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
});