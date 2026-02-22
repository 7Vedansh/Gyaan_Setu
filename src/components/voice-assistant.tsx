import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  TextInput,
  ViewStyle,
} from "react-native";

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Icon } from "@/components/icons";
import { Text, View } from "@/components/themed";
import { Button } from "@/components/ui/Button";
import { theme } from "@/theme/theme";
import { useVoiceAssistant, Message } from "@/hooks/useVoiceAssistant";
import { ttsService } from "@/services/tts.service";
import { detectLanguage } from "@/lib/mockAI";

interface VoiceAssistantProps {
  context?: string;
  style?: StyleProp<ViewStyle>;
}

export function VoiceAssistant({ context, style }: VoiceAssistantProps) {
  const {
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
  } = useVoiceAssistant({ context });

  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isLoading]);


  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 600 }}
      style={[
        {
          borderRadius: theme.radius.xl,
          backgroundColor: isOnline ? "rgba(124, 58, 237, 0.05)" : "transparent",
          overflow: "hidden",
          flex: 1,
          borderWidth: 1,
          borderColor: theme.colors.glassBorder,
        },
        style,
      ]}
    >
      <BlurView
        intensity={60}
        tint="dark"
        style={{
          padding: theme.spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.glassBorder,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          ...theme.shadows.md,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.md }}>
          <View style={{ position: "relative" }}>
            <MotiView
              from={{ opacity: 0.3, scale: 1 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{
                type: "timing",
                duration: 2000,
                loop: true,
              }}
              style={{
                position: "absolute",
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: theme.colors.primary,
                top: -2,
                left: -2,
              }}
            />
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.primary,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: theme.colors.glassBorder,
              }}
            >
              <Icon name="shieldStar" size={22} color={theme.colors.primaryForeground} />
            </View>
            <View
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: theme.colors.secondary,
                borderWidth: 2,
                borderColor: theme.colors.background,
                shadowColor: theme.colors.secondary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 4,
                elevation: 4,
              }}
            />
          </View>
          <View>
            <Text style={{
              fontSize: theme.typography.sizes.md,
              fontFamily: theme.typography.fontFamily.heading,
              fontWeight: theme.typography.weights.semibold as any,
              color: theme.colors.text.primary,
              letterSpacing: 0.5
            }}>
              Parth AI
            </Text>
            <Text style={{ fontSize: 11, color: theme.colors.text.secondary, fontWeight: "600" }}>
              {isOnline ? "Online & Ready" : "System Standby"}
            </Text>
          </View>
        </View>

        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            backgroundColor: "rgba(124, 58, 237, 0.1)",
          }}
        >
          <Text style={{
            fontSize: 10,
            fontWeight: "900",
            color: theme.colors.primary,
            letterSpacing: 1
          }}>
            AI POWERED
          </Text>
        </View>
      </BlurView>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: theme.spacing.lg,
          gap: theme.spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <MotiView
              key={message.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{
                type: "timing",
                duration: 400,
                delay: index * 50,
              }}
              style={{
                flexDirection: "row",
                justifyContent: isUser ? "flex-end" : "flex-start",
                gap: theme.spacing.sm,
              }}
            >
              {!isUser && (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(124, 58, 237, 0.1)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 4,
                    borderWidth: 1,
                    borderColor: theme.colors.glassBorder,
                  }}
                >
                  <Icon name="shieldStar" size={16} color={theme.colors.primary} />
                </View>
              )}
              <View style={{ maxWidth: "80%" }}>
                {isUser ? (
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      borderRadius: 20,
                      borderBottomRightRadius: 4,
                      ...theme.shadows.md,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.md,
                        lineHeight: theme.typography.sizes.md * theme.typography.lineHeight,
                        color: theme.colors.primaryForeground,
                        fontWeight: theme.typography.weights.medium as any,
                      }}
                    >
                      {message.content}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={{
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                      borderRadius: 20,
                      borderBottomLeftRadius: 4,
                      backgroundColor: theme.colors.surfaceDark,
                      borderWidth: 1,
                      borderColor: theme.colors.glassBorder,
                      ...theme.shadows.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.typography.sizes.md,
                        lineHeight: theme.typography.sizes.md * theme.typography.lineHeight,
                        color: theme.colors.text.primary,
                        fontWeight: theme.typography.weights.medium as any,
                      }}
                    >
                      {message.content}
                    </Text>
                  </View>
                )}

                {message.role === "assistant" && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 8,
                      marginLeft: 4,
                    }}
                  >
                    <Pressable
                      onPress={() => {
                        if (currentSpeakingId === message.id) {
                          ttsService.stop();
                          setCurrentSpeakingId(null);
                        } else {
                          const lang = detectLanguage(message.content);
                          const langCode = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-US';

                          ttsService.speak(message.content, {
                            language: langCode,
                            onStart: () => setCurrentSpeakingId(message.id),
                            onDone: () => setCurrentSpeakingId(null),
                            onError: () => setCurrentSpeakingId(null),
                          });
                        }
                      }}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                      })}
                    >
                      <Icon
                        name={currentSpeakingId === message.id ? "stop" : "scan"}
                        size={12}
                        color={theme.colors.primary}
                      />
                      <Text style={{
                        fontSize: 11,
                        color: theme.colors.primary,
                        fontWeight: "700"
                      }}>
                        {currentSpeakingId === message.id ? "STOPPING" : "LISTEN"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
              {isUser && (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 4,
                    ...theme.shadows.sm,
                  }}
                >
                  <Icon name="profile" size={16} color={theme.colors.primaryForeground} />
                </View>
              )}
            </MotiView>
          );
        })}
        {isLoading && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(124, 58, 237, 0.1)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: theme.colors.glassBorder,
              }}
            >
              <Icon name="shieldStar" size={16} color={theme.colors.primary} />
            </View>
            <View
              style={{
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
                borderRadius: 20,
                borderBottomLeftRadius: 4,
                backgroundColor: theme.colors.surfaceDark,
                borderWidth: 1,
                borderColor: theme.colors.glassBorder,
                minWidth: 80,
                overflow: "hidden",
              }}
            >
              <MotiView
                from={{ translateX: -60 }}
                animate={{ translateX: 100 }}
                transition={{
                  type: "timing",
                  duration: 1000,
                  loop: true,
                  repeatReverse: false,
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 40,
                  backgroundColor: "rgba(124, 58, 237, 0.2)",
                  transform: [{ skewX: "-20deg" }],
                }}
              />
              <View style={{ flexDirection: "row", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <MotiView
                    key={i}
                    from={{ opacity: 0.3, scale: 1 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    transition={{
                      type: "timing",
                      duration: 400,
                      delay: i * 200,
                      loop: true,
                    }}
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: theme.colors.primary,
                    }}
                  />
                ))}
              </View>
            </View>
          </MotiView>
        )}
      </ScrollView>

      <BlurView
        intensity={80}
        tint="dark"
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.glassBorder,
          padding: theme.spacing.lg,
          paddingBottom: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.sm,
            alignItems: "flex-end"
          }}
        >
          <MotiView
            animate={{
              scale: isListening ? [1, 1.1, 1] : 1,
            }}
            transition={{
              type: "timing",
              duration: 1000,
              loop: true,
            }}
          >
            <LinearGradient
              colors={isListening ? [theme.colors.secondary, theme.colors.sucess] : [theme.colors.primary, theme.colors.primaryLight]}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
                ...theme.shadows.md,
                shadowColor: isListening ? theme.colors.secondary : theme.colors.primary,
              }}
            >
              <Pressable
                onPress={handleVoiceInput}
                style={({ pressed }) => ({
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Icon
                  name={isListening ? "stop" : "mic"}
                  size={24}
                  color={theme.colors.primaryForeground}
                />
              </Pressable>
            </LinearGradient>
          </MotiView>

          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 26,
              borderWidth: 1,
              borderColor: theme.colors.glassBorder,
              flexDirection: "row",
              alignItems: "flex-end",
              paddingHorizontal: theme.spacing.md,
              paddingVertical: 8,
              minHeight: 52,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask Parth anything..."
              placeholderTextColor={theme.colors.text.secondary}
              editable={!isLoading}
              onSubmitEditing={handleSend}
              multiline
              style={{
                flex: 1,
                fontSize: theme.typography.sizes.md,
                color: theme.colors.text.primary,
                maxHeight: 120,
                paddingTop: 8,
                paddingBottom: 8,
                fontFamily: theme.typography.fontFamily.body,
                fontWeight: theme.typography.weights.medium as any,
              }}
            />
          </View>

          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              alignItems: "center",
              justifyContent: "center",
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              ...theme.shadows.md,
            }}
          >
            <Pressable
              onPress={handleSend}
              disabled={!input.trim() || isLoading}
              style={({ pressed }) => ({
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Icon name="send" size={22} color={theme.colors.primaryForeground} />
            </Pressable>
          </LinearGradient>
        </View>

        {isListening && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <ActivityIndicator size="small" color={theme.colors.secondary} />
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.secondary,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              LISTENING...
            </Text>
          </MotiView>
        )}
      </BlurView>
    </MotiView>
  );
}
