import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAppTheme } from "./ThemeProvider";

export default function ScreenHeader({
  title,
  subtitle,
  showBackButton = false,
  rightContent,
  scrollY,
  style,
  titleStyle,
  children,
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useAppTheme();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: theme.background,
          paddingTop: insets.top + 20,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: scrollY ? scrollY.interpolate({
            inputRange: [0, 50],
            outputRange: [0, 1],
          }) : 0,
          borderBottomColor: theme.border,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handleBackPress}
              style={{
                width: 24,
                height: 24,
                marginBottom: 16,
              }}
            >
              <ArrowLeft color={theme.text} size={24} />
            </TouchableOpacity>
          )}

          <Text
            style={[
              {
                fontSize: 28,
                fontFamily: "Inter_700Bold",
                color: theme.text,
                lineHeight: 32,
                marginBottom: subtitle ? 4 : 0,
              },
              titleStyle,
            ]}
          >
            {title}
          </Text>

          {subtitle && (
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_400Regular",
                color: theme.textSecondary,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {rightContent && rightContent}
      </View>

      {children}
    </Animated.View>
  );
}