import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "./ThemeProvider";

export default function ScreenLayout({ children, style }) {
  const { theme, colorScheme } = useAppTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.background,
        },
        style,
      ]}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      {children}
    </View>
  );
}