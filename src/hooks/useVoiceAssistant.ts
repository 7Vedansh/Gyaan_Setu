import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
    getAIResponse,
    speakText,
    startListening,
    stopSpeaking,
} from "@/lib/mockAI";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    isLocal?: boolean;
}

interface UseVoiceAssistantProps {
    context?: string;
}

export function useVoiceAssistant({ context }: UseVoiceAssistantProps = {}) {
    const { isOnline } = useOnlineStatus();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content:
                "Hi! I'm your AI tutor. Ask me anything about your lessons, and I'll help you understand better!",
            isLocal: true,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
        null
    );

    const stopListeningRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        return () => {
            stopListeningRef.current?.();
            stopSpeaking();
        };
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await getAIResponse(
                context
                    ? `Context: ${context}\n\nQuestion: ${userMessage.content}`
                    : userMessage.content
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.text,
                isLocal: response.isLocal,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm having trouble right now. Please try again!",
                isLocal: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceInput = () => {
        if (isListening) {
            stopListeningRef.current?.();
            stopListeningRef.current = null;
            setIsListening(false);
            return;
        }

        setIsListening(true);
        stopListeningRef.current = startListening(
            (text) => {
                setInput(text);
            },
            () => {
                setIsListening(false);
            }
        );

        if (!stopListeningRef.current) {
            setIsListening(false);
        }
    };

    const handleSpeak = (message: Message) => {
        if (speakingMessageId === message.id) {
            stopSpeaking();
            setSpeakingMessageId(null);
            return;
        }

        stopSpeaking();
        setSpeakingMessageId(message.id);
        const started = speakText(message.content, {
            onEnd: () => setSpeakingMessageId(null),
            onError: () => setSpeakingMessageId(null),
        });

        if (!started) {
            setSpeakingMessageId(null);
        }
    };

    return {
        messages,
        input,
        setInput,
        isLoading,
        isListening,
        isOnline,
        speakingMessageId,
        handleSend,
        handleVoiceInput,
        handleSpeak,
    };
}
