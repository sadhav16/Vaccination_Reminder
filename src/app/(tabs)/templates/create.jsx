import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Minus, Save } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import ScreenLayout from "@/components/ScreenLayout";
import ScreenHeader from "@/components/ScreenHeader";
import { useAppTheme } from "@/components/ThemeProvider";
import { useAppFonts } from "@/components/useFontLoader";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function CreateTemplateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useAppTheme();
  const fontsLoaded = useAppFonts();
  const queryClient = useQueryClient();
  const [scrollY] = useState(new Animated.Value(0));

  const [diseaseName, setDiseaseName] = useState('');
  const [sessionCount, setSessionCount] = useState(3);
  const [gaps, setGaps] = useState([0, 7, 14]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
      Alert.alert('Success', 'Template created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to create template');
    },
  });

  const handleSessionCountChange = (newCount) => {
    if (newCount < 1 || newCount > 10) return;
    
    setSessionCount(newCount);
    
    // Adjust gaps array
    if (newCount > gaps.length) {
      // Add new gaps
      const lastGap = gaps[gaps.length - 1] || 0;
      const newGaps = [...gaps];
      for (let i = gaps.length; i < newCount; i++) {
        newGaps.push(lastGap + 7);
      }
      setGaps(newGaps);
    } else {
      // Remove extra gaps
      setGaps(gaps.slice(0, newCount));
    }
  };

  const handleGapChange = (index, value) => {
    const numValue = parseInt(value) || 0;
    const newGaps = [...gaps];
    newGaps[index] = numValue;
    setGaps(newGaps);
  };

  const handleCreate = () => {
    if (!diseaseName.trim()) {
      Alert.alert('Error', 'Please enter a disease name');
      return;
    }

    createMutation.mutate({
      disease_name: diseaseName.trim(),
      session_count: sessionCount,
      gaps: gaps,
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const headerHeight = 80 + insets.top;

  return (
    <ScreenLayout>
      <ScreenHeader
        title="Create Template"
        subtitle="Add new vaccination template"
        showBackButton={true}
        scrollY={scrollY}
      />

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: headerHeight + 24,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Disease Name */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Disease Name
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: theme.borderInput,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: theme.inputBackground,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: theme.text,
              }}
              placeholder="e.g., Rabies, Hepatitis B"
              placeholderTextColor={theme.textSecondary}
              value={diseaseName}
              onChangeText={setDiseaseName}
            />
          </View>

          {/* Session Count */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: theme.text,
                marginBottom: 12,
              }}
            >
              Number of Sessions
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: theme.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: sessionCount <= 1 ? 0.5 : 1,
                }}
                onPress={() => handleSessionCountChange(sessionCount - 1)}
                disabled={sessionCount <= 1}
                activeOpacity={0.8}
              >
                <Minus color="#FFFFFF" size={20} />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 24,
                  fontFamily: "Inter_700Bold",
                  color: theme.text,
                }}
              >
                {sessionCount} {sessionCount === 1 ? 'Session' : 'Sessions'}
              </Text>

              <TouchableOpacity
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: theme.accent,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: sessionCount >= 10 ? 0.5 : 1,
                }}
                onPress={() => handleSessionCountChange(sessionCount + 1)}
                disabled={sessionCount >= 10}
                activeOpacity={0.8}
              >
                <Plus color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Session Gaps */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Session Schedule (Days from Start)
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Inter_400Regular",
                color: theme.textSecondary,
                marginBottom: 16,
              }}
            >
              Enter the day number for each session
            </Text>

            {gaps.map((gap, index) => (
              <View
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: theme.surface,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontFamily: "Inter_600SemiBold",
                      color: theme.text,
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>

                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: theme.borderInput,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: theme.inputBackground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.text,
                  }}
                  placeholder="Day number"
                  placeholderTextColor={theme.textSecondary}
                  value={gap.toString()}
                  onChangeText={(value) => handleGapChange(index, value)}
                  keyboardType="number-pad"
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bottom Action */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.bottomArea,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: theme.bottomBorder,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: theme.accent,
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={handleCreate}
            disabled={createMutation.isPending}
            activeOpacity={0.8}
          >
            <Save color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Template'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingAnimatedView>
    </ScreenLayout>
  );
}