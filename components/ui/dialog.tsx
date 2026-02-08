import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, StyleProp, ViewStyle } from "react-native";

import { layouts } from "@/constants/layouts";
import { useTheme } from "@/context/theme";
import { changeColorOpacity } from "@/lib/utils";

import { Text, View } from "../themed";

interface Props {
  trigger: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Dialog({
  children,
  trigger,
  title,
  contentContainerStyle,
}: Props) {
  const { border, background, mutedForeground } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const openModal = () => setIsVisible(true);
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setIsVisible(false));
  };

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 100,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, scaleAnim, opacityAnim]);

  return (
    <>
      <Pressable onPress={openModal}>{trigger}</Pressable>
      <Modal
        transparent={true}
        visible={isVisible}
        animationType="none"
        onRequestClose={closeModal}
      >
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: changeColorOpacity(background, 0.85),
            opacity: opacityAnim,
            cursor: "default",
          }}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              cursor: "default",
            }}
            onPress={closeModal}
          >
            <Animated.View
              style={{
                cursor: "default",
                transform: [{ scale: scaleAnim }],
              }}
            >
              <Pressable style={{ cursor: "default" }}>
                <View
                  style={{
                    width: 320,
                    borderWidth: layouts.borderWidth,
                    borderColor: border,
                    borderRadius: layouts.radiusLg,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 5,
                  }}
                >
                  {title && (
                    <View
                      style={{
                        borderBottomWidth: layouts.borderWidth,
                        borderBottomColor: border,
                        padding: layouts.padding,
                        backgroundColor: changeColorOpacity(border, 0.5),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          textAlign: "center",
                          color: mutedForeground,
                          letterSpacing: 0.2,
                        }}
                      >
                        {title}
                      </Text>
                    </View>
                  )}
                  <View
                    style={[
                      { padding: layouts.padding, gap: layouts.padding },
                      contentContainerStyle,
                    ]}
                  >
                    {children}
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </>
  );
}
