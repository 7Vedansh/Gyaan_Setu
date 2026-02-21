// FractionScreen.tsx

import React from "react";
import { View, Text } from "react-native";
import FractionPizza from "@/components/animations/FractionPizza";

export default function FractionScreen() {
    const animationSpec = {
        totalSlices: 8,
        highlightSlices: 7,
        duration: 1200,
    };

    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#FFF",
            }}
        >
            <Text style={{ fontSize: 24, marginBottom: 20 }}>
                What is 3/8?
            </Text>

            <FractionPizza {...animationSpec} />

            <Text style={{ fontSize: 20, marginTop: 20 }}>
                3 out of 8 slices
            </Text>
        </View>
    );
}