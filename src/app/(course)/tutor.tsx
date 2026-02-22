import { Metadata } from "@/components/metadata";
import { Text, View } from "@/components/themed";
import { VoiceAssistant } from "@/components/voice-assistant";
import { layouts } from "@/constants/layouts";

import { theme } from "@/theme/theme";

import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";

const Particle = ({ delay = 0, size = 4, left = "10%", top = "20%" }) => (
    <MotiView
        from={{ opacity: 0, translateY: 0, scale: 1 }}
        animate={{ opacity: [0.1, 0.3, 0.1], translateY: -100, scale: [1, 1.5, 1] }}
        transition={{
            type: "timing",
            duration: 8000 + Math.random() * 4000,
            loop: true,
            delay: delay,
        }}
        style={{
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
            left: left as any,
            top: top as any,
            zIndex: 0,
        }}
    />
);

export default function Tutor() {
    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient as any}
            style={{ flex: 1 }}
        >
            <View style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.3 }}>
                <Particle delay={0} size={6} left="15%" top="80%" />
                <Particle delay={2000} size={4} left="80%" top="60%" />
                <Particle delay={4000} size={8} left="40%" top="90%" />
                <Particle delay={1000} size={5} left="70%" top="20%" />
            </View>
            <Metadata
                title="Parth AI Tutor"
                description="Your premium AI-first learning experience"
            />
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: theme.spacing.xl,
                    paddingTop: theme.spacing.xxl,
                    gap: theme.spacing.xl,
                }}
            >
                <View style={{ gap: theme.spacing.xs }}>
                    <Text
                        style={{
                            fontSize: theme.typography.sizes.xxl,
                            fontFamily: theme.typography.fontFamily.heading,
                            fontWeight: theme.typography.weights.semibold as any,
                            color: theme.colors.text.primary,
                            letterSpacing: theme.typography.letterSpacing.title,
                        }}
                    >
                        Parth AI Tutor
                    </Text>
                    <Text
                        style={{
                            fontSize: theme.typography.sizes.sm,
                            color: theme.colors.text.secondary,
                            lineHeight: theme.typography.sizes.sm * theme.typography.lineHeight,
                            fontWeight: theme.typography.weights.medium as any,
                        }}
                    >
                        Your personal learning assistant. Ask anything or practice speaking.
                    </Text>
                </View>
                <VoiceAssistant
                    context="Hindi language learning support"
                    style={{ flex: 1, marginBottom: theme.spacing.lg }}
                />
            </View>
        </LinearGradient>
    );
}
