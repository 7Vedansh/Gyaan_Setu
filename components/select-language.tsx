import { useState } from "react";
import { Image } from "expo-image";
import { Pressable } from "react-native";
import Popover from "react-native-popover-view/dist/Popover";
import { Placement } from "react-native-popover-view/dist/Types";

import { Text, View } from "@/components/themed";
import { getLanguage, languages } from "@/config/language";
import { layouts } from "@/constants/layouts";
import { useLanguageCode } from "@/context/language";
import { useTheme } from "@/context/theme";
import { SupportedLanguageCode } from "@/types";

interface Props {
  excludes?: SupportedLanguageCode[];
}

export function SelectLanguage({ excludes }: Props) {
  const { border, mutedForeground, accent, background } = useTheme();
  const { languageCode, setLanguageCode } = useLanguageCode();
  const [isVisiable, setIsVisiable] = useState(false);

  return (
    <Popover
      placement={Placement.BOTTOM}
      isVisible={isVisiable}
      onRequestClose={() => setIsVisiable(false)}
      popoverStyle={{
        borderRadius: layouts.padding,
        backgroundColor: border,
      }}
      backgroundStyle={{
        backgroundColor: background,
        opacity: 0.5,
      }}
      from={
        <Pressable
          style={{
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
          }}
          onPress={() => setIsVisiable(!isVisiable)}
        >
          <View>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: mutedForeground,
                textTransform: "uppercase",
              }}
            >
              {getLanguage(languageCode)?.name}
            </Text>
          </View>
        </Pressable>
      }
    >
      <View
        style={{
          borderWidth: layouts.borderWidth,
          borderRadius: layouts.padding,
          borderColor: border,
          overflow: "hidden",
          minWidth: 300,
        }}
      >
        {Object.keys(languages).map((key, index) => {
          const code = key as SupportedLanguageCode;
          const language = languages[code];

          if (excludes?.includes(code)) {
            return null;
          }

          return (
            <Pressable
              key={index}
              onPress={() => {
                setIsVisiable(false);
                setLanguageCode(code);
              }}
            >
              {({ hovered, pressed }) => (
                <View
                  style={{
                    padding: layouts.padding,
                    flexDirection: "row",
                    gap: layouts.padding,
                    alignItems: "center",
                    backgroundColor: hovered || pressed ? accent : background,
                  }}
                >
                  <Image
                    source={language.flag}
                    style={{
                      width: 32,
                      aspectRatio: 4 / 3,
                      borderRadius: layouts.padding / 2,
                      borderWidth: layouts.borderWidth,
                      borderColor: border,
                    }}
                  />
                  <Text>{language.name}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </Popover>
  );
}
