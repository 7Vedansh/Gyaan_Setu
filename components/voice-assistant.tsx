import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  TextInput,
  ViewStyle,
} from "react-native";

import { Icon } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/button";
import { colors } from "@/constants/colors";
import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  getAIResponse,
  speakText,
  startListening,
  stopSpeaking,
} from "@/lib/mockAI";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLocal?: boolean;
}

interface VoiceAssistantProps {
  context?: string;
  style?: StyleProp<ViewStyle>;
}

export function VoiceAssistant({ context, style }: VoiceAssistantProps) {
  const { isOnline } = useOnlineStatus();
  const {
    border,
    muted,
    mutedForeground,
    primary,
    primaryForeground,
    secondary,
    accent,
    foreground,
    background,
  } = useTheme();

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
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);

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

  return (
    <View
      style={[
        {
          borderRadius: layouts.radiusLg,
          borderWidth: layouts.borderWidth,
          borderColor: border,
          backgroundColor: secondary,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
        style,
      ]}
    >
      <View
        style={{
          padding: layouts.padding * 1.5,
          borderBottomWidth: layouts.borderWidth,
          borderBottomColor: border,
          backgroundColor: accent,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: layouts.padding,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: primary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="shieldStar" size={18} color={primaryForeground} />
          </View>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "700", letterSpacing: -0.2 }}>
              AI Tutor
            </Text>
            <Text style={{ fontSize: 12, color: mutedForeground }}>
              {isOnline ? "Cloud AI active" : "Local AI (offline)"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: layouts.padding * 1.25,
          gap: layouts.padding,
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <View
              key={message.id}
              style={{
                flexDirection: "row",
                justifyContent: isUser ? "flex-end" : "flex-start",
                gap: layouts.padding,
              }}
            >
              {!isUser && (
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: accent,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <Icon name="shieldStar" size={14} color={primary} />
                </View>
              )}
              <View style={{ maxWidth: "80%" }}>
                <View
                  style={{
                    paddingHorizontal: layouts.padding,
                    paddingVertical: layouts.padding * 0.75,
                    borderRadius: layouts.radiusLg,
                    borderTopLeftRadius: isUser ? layouts.radiusLg : 6,
                    borderTopRightRadius: isUser ? 6 : layouts.radiusLg,
                    backgroundColor: isUser ? primary : muted,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      color: isUser ? primaryForeground : undefined,
                    }}
                  >
                    {message.content}
                  </Text>
                </View>
                {message.role === "assistant" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    {message.isLocal && (
                      <Text style={{ fontSize: 11, color: mutedForeground }}>
                        Local
                      </Text>
                    )}
                    <Pressable onPress={() => handleSpeak(message)}>
                      <Text style={{ fontSize: 11, color: mutedForeground }}>
                        {speakingMessageId === message.id
                          ? "Stop"
                          : "Listen"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
              {isUser && (
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 2,
                  }}
                >
                  <Icon name="profile" size={14} color={primaryForeground} />
                </View>
              )}
            </View>
          );
        })}
        {isLoading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: layouts.padding,
            }}
          >
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="shieldStar" size={14} color={primary} />
            </View>
            <View
              style={{
                paddingHorizontal: layouts.padding,
                paddingVertical: layouts.padding * 0.75,
                borderRadius: layouts.radiusLg,
                backgroundColor: muted,
              }}
            >
              <ActivityIndicator size="small" color={mutedForeground} />
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          borderTopWidth: layouts.borderWidth,
          borderTopColor: border,
          padding: layouts.padding * 1.25,
          backgroundColor: colors.transparent,
          gap: layouts.padding,
        }}
      >
        <View style={{ flexDirection: "row", gap: layouts.padding }}>
          <Button
            variant={isListening ? "ghost" : "outline"}
            viewStyle={{
              paddingHorizontal: layouts.padding,
              minWidth: 72,
            }}
            onPress={handleVoiceInput}
          >
            <Text style={{ fontSize: 12, fontWeight: "700" }}>
              {isListening ? "Stop" : "Mic"}
            </Text>
          </Button>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type or speak your question..."
            placeholderTextColor={mutedForeground}
            editable={!isLoading}
            onSubmitEditing={handleSend}
            style={{
              flex: 1,
              borderWidth: layouts.borderWidth,
              borderColor: border,
              borderRadius: layouts.radius,
              paddingHorizontal: layouts.padding,
              paddingVertical: layouts.padding * 0.75,
              fontSize: 14,
              color: foreground,
              backgroundColor: background,
            }}
          />
          <Button
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
            viewStyle={{
              paddingHorizontal: layouts.padding,
              minWidth: 72,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700" }}>Send</Text>
          </Button>
        </View>
        {isListening && (
          <Text
            style={{
              fontSize: 12,
              textAlign: "center",
              color: mutedForeground,
            }}
          >
            Listening... Speak now.
          </Text>
        )}
      </View>
    </View>
  );
}
