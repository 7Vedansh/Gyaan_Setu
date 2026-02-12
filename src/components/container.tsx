import { useTheme } from "@/context/theme";
import { View, ViewProps } from "@/components/themed";
import { layouts } from "@/constants/layouts";

interface Props extends ViewProps {
  children: React.ReactNode;
  layout?: "sm" | "lg";
}
export function Container({ children, layout = "sm", style, ...props }: Props) {
  const theme = useTheme();
  const background = theme.background;
  return (
    <View
      style={[
        {
          flex: 1,
          maxWidth: layout === "sm" ? 1024 : 1400,
          width: "100%",
          marginHorizontal: "auto",
          paddingHorizontal: layouts.padding,
          paddingVertical: layouts.padding,
          backgroundColor: background,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}