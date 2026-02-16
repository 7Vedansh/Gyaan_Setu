import { Metadata } from "@/components/metadata";
import { Text, View } from "@/components/themed";
import { VoiceAssistant } from "@/components/voice-assistant";
import { layouts } from "@/constants/layouts";

export default function Tutor() {
    return (
        <>
            <Metadata
                title="AI Tutor"
                description="Practice with the AI tutor and voice assistant"
            />
            <View
                style={{
                    flex: 1,
                    padding: layouts.padding * 2,
                    gap: layouts.padding,
                }}
            >
                <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 24, fontWeight: "800", letterSpacing: -0.3 }}>
                        AI Tutor
                    </Text>
                    <Text style={{ fontSize: 14 }}>
                        Ask questions by typing or voice. Responses use the mock AI assistant flow.
                    </Text>
                </View>
                <VoiceAssistant
                    context="Hindi language learning support"
                    style={{ flex: 1, minHeight: 520 }}
                />
            </View>
        </>
    );
}
