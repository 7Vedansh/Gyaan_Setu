import React, { useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { theme } from "@/theme/theme";
import { Text } from "@/components/ui/Text";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Bot, Send } from "lucide-react-native";
import { MotiView } from "moti";
import { KeyboardAvoidingView as TextEntry } from "react-native";

export const TutorChat = () => {
    const [messages, setMessages] = useState<{ id: string; text: string; sender: "user" | "bot" }[]>([
        { id: "1", text: "Hello! I'm your AI buddy. Ask me anything!", sender: "bot" },
    ]);
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMsg = { id: Date.now().toString(), text: inputText, sender: "user" as const };
        setMessages((prev) => [...prev, newMsg]);
        setInputText("");

        // Simulate bot response
        setTimeout(() => {
            const botResponse = {
                id: (Date.now() + 1).toString(),
                text: "That's consistent! Let's solve it together.",
                sender: "bot" as const,
            };
            setMessages((prev) => [...prev, botResponse]);
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
            <View style={styles.header}>
                <MotiView
                    from={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                    style={styles.mascot}
                >
                    <Bot size={40} color={theme.colors.secondary} />
                </MotiView>
                <Text variant="h2" color={theme.colors.text.primary}>
                    AI Buddy
                </Text>
            </View>

            <ScrollView contentContainerStyle={styles.chatArea}>
                {messages.map((msg) => (
                    <MotiView
                        key={msg.id}
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        style={[
                            styles.messageBubble,
                            msg.sender === "user" ? styles.userBubble : styles.botBubble,
                        ]}
                    >
                        <Text
                            color={msg.sender === "user" ? theme.colors.text.inverse : theme.colors.text.primary}
                        >
                            {msg.text}
                        </Text>
                    </MotiView>
                ))}
            </ScrollView>

            <View style={styles.inputArea}>
                <Input
                    placeholder="Ask something..."
                    value={inputText}
                    onChangeText={setInputText}
                    containerStyle={{ flex: 1, marginBottom: 0 }}
                    style={{ height: 48 }}
                />
                <Button
                    variant="primary"
                    size="md"
                    label=""
                    rightIcon={<Send size={20} color="white" />}
                    onPress={handleSend}
                    style={{ width: 48, borderRadius: 24, marginLeft: 8 }}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    mascot: {
        marginBottom: 8,
        backgroundColor: theme.colors.background,
        padding: 8,
        borderRadius: 50,
    },
    chatArea: {
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 16,
        maxWidth: "80%",
    },
    userBubble: {
        alignSelf: "flex-end",
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    botBubble: {
        alignSelf: "flex-start",
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 4,
        ...theme.shadows.sm,
    },
    inputArea: {
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        alignItems: "center",
    },
});
