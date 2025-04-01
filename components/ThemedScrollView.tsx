import {
  ScrollView,
  ScrollViewProps,
  View,
  type ViewProps,
} from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabOverflow } from "./ui/TabBarBackground";

export type ThemedScrollViewProps = ScrollViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedScrollView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedScrollViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <ScrollView style={[{ backgroundColor }, style]} {...otherProps} />;
}
