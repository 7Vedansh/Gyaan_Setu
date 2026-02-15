import { Stack } from "expo-router";

export default function QuizLayout(): JSX.Element {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}