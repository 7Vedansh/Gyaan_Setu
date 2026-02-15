import { Text, View } from "@/components/themed";
import { Card } from "@/components/ui/Card";
import { StyleSheet, TouchableOpacity } from "react-native";

interface Quiz {
    id: number;
    title: string;
    description: string;
    subject: string;
}

const quizzes: Quiz[] = [
    { id: 1, title: "Physics Basics", description: "Learn the fundamentals of physics.", subject: "Physics" },
    { id: 2, title: "Chemistry Reactions", description: "Understand chemical reactions.", subject: "Chemistry" },
    { id: 3, title: "Algebra Essentials", description: "Master the basics of algebra.", subject: "Mathematics" },
    { id: 4, title: "Biology Cells", description: "Explore the world of cells.", subject: "Biology" },
];

export default function Quiz(): JSX.Element {
    return (
        <View style={styles.container}>
            {quizzes.map((quiz) => (
                <TouchableOpacity key={quiz.id} onPress={() => handleQuizPress(quiz.id)}>
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

function handleQuizPress(quizId: number): void {
    console.log(`Quiz ${quizId} clicked`);
    // Navigate to the quiz details or start page
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