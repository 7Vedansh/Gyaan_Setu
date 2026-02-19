import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { Flame } from "lucide-react-native";
import { StreakModal } from "./streak/StreakModal";

interface Props {
    streak: number;
}

export function StreakBadge({ streak }: Props) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <TouchableOpacity
                onPress={() => setOpen(true)}
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#263244",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    gap: 6,
                }}
            >
                <Flame size={20} color="#F97316" fill="#F97316" />
                <Text
                    style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 14,
                    }}
                >
                    {streak}
                </Text>
            </TouchableOpacity>

            <StreakModal visible={open} onClose={() => setOpen(false)} />
        </>
    );
}
