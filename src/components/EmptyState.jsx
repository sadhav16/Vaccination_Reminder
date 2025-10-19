import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAppTheme } from "./ThemeProvider";

export default function EmptyState({
  icon: IconComponent,
  title,
  description,
  buttonText,
  onButtonPress,
  iconSize = 24,
  style,
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        {
          alignItems: "center",
          paddingHorizontal: 20,
          flex: 1,
          justifyContent: "center",
        },
        style,
      ]}
    >
      {IconComponent && (
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.emptyBackground,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
            borderWidth: 2,
            borderColor: theme.emptyBorder,
            borderStyle: "dashed",
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.emptyBorder,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconComponent color={theme.textSecondary} size={iconSize} />
          </View>
        </View>
      )}

      <Text
        style={{
          fontSize: 20,
          fontFamily: "Inter_600SemiBold",
          color: theme.text,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontSize: 16,
          fontFamily: "Inter_400Regular",
          color: theme.textSecondary,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: buttonText ? 32 : 0,
        }}
      >
        {description}
      </Text>

      {buttonText && (
        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            borderRadius: 16,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
          onPress={onButtonPress}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_600SemiBold",
              color: "#FFFFFF",
            }}
          >
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}