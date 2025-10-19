import { useColorScheme } from "react-native";

export const useAppTheme = () => {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      background: "#FFFFFF",
      surface: "#F8F9FA",
      surfaceSecondary: "#F3F3F5",
      text: "#2F2F2F",
      textSecondary: "#8E9298",
      accent: "#FF7C5D",
      border: "#E5E7EB",
      borderLight: "#E9ECEF",
      borderInput: "#DDDDDD",
      card: "#FFFFFF",
      emptyBackground: "#F8F9FA",
      emptyBorder: "#E9ECEF",
      inputBackground: "#FFFFFF",
      modalBackground: "#FFFFFF",
      modalOverlay: "rgba(0,0,0,0.5)",
      bottomArea: "#FFFFFF",
      bottomBorder: "#F5F7FA",
      buttonIcon: "rgba(255, 132, 96, 0.15)",
      surfaceBorder: "#E9ECEF",
      iconBackground: "#E9ECEF",
      iconColor: "#8E9298",
    },
    dark: {
      background: "#121212",
      surface: "#1E1E1E",
      surfaceSecondary: "#2A2A2A",
      text: "#FFFFFF",
      textSecondary: "#B3B3B3",
      accent: "#FF8B6B",
      border: "#333333",
      borderLight: "#404040",
      borderInput: "#555555",
      card: "#1E1E1E",
      emptyBackground: "#1E1E1E",
      emptyBorder: "#404040",
      inputBackground: "#1E1E1E",
      modalBackground: "#1E1E1E",
      modalOverlay: "rgba(0,0,0,0.7)",
      bottomArea: "#1E1E1E",
      bottomBorder: "#333333",
      buttonIcon: "rgba(255, 139, 107, 0.15)",
      surfaceBorder: "#404040",
      iconBackground: "#404040",
      iconColor: "#B3B3B3",
    },
  };

  return {
    theme: colors[colorScheme] || colors.light,
    colorScheme,
    isDark: colorScheme === "dark",
  };
};