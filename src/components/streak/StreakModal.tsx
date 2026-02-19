import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Platform } from "react-native";
import { X } from "lucide-react-native";
import { PersonalStreak } from "./PersonalStreak";
import { FriendsStreak } from "./FriendsStreak";

interface Props {
    visible: boolean;
    onClose: () => void;
}

export function StreakModal({ visible, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<"personal" | "friends">("personal");
    const { height } = Dimensions.get("window");

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={[styles.modalContent, { maxHeight: height * 0.8 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Streak</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "personal" && styles.activeTab]}
                            onPress={() => setActiveTab("personal")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "personal" && styles.activeTabText,
                                ]}
                            >
                                PERSONAL
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === "friends" && styles.activeTab]}
                            onPress={() => setActiveTab("friends")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "friends" && styles.activeTabText,
                                ]}
                            >
                                FRIENDS
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {activeTab === "personal" ? <PersonalStreak /> : <FriendsStreak />}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        padding: 16,
    },
    modalContent: {
        backgroundColor: "#263244",
        borderRadius: 24,
        width: "100%",
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#334155",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    title: {
        color: "#F97316",
        fontSize: 20,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    closeButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center",
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    activeTab: {
        borderBottomColor: "#F97316",
    },
    tabText: {
        color: "#94A3B8",
        fontWeight: "bold",
        fontSize: 14,
        letterSpacing: 0.5,
    },
    activeTabText: {
        color: "#F97316",
    },
    content: {
        paddingVertical: 16,
    },
});
