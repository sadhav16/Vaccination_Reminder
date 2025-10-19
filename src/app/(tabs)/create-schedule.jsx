import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";

import ScreenLayout from "@/components/ScreenLayout";
import ScreenHeader from "@/components/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { useAppTheme } from "@/components/ThemeProvider";
import { useAppFonts } from "@/components/useFontLoader";

export default function CreateScheduleScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useAppTheme();
  const fontsLoaded = useAppFonts();
  const queryClient = useQueryClient();
  const [scrollY] = useState(new Animated.Value(0));

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: templatesData } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const response = await fetch("/api/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      return response.json();
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create schedule");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["upcoming-sessions"]);
      queryClient.invalidateQueries(["schedules"]);
      Alert.alert("Success", "Schedule created successfully", [
        { text: "View Schedule", onPress: () => router.push("/(tabs)/home") },
      ]);
      setSelectedTemplate(null);
      setStartDate(new Date());
    },
    onError: () => {
      Alert.alert("Error", "Failed to create schedule");
    },
  });

  const handleCreateSchedule = () => {
    if (!selectedTemplate) {
      Alert.alert("Error", "Please select a template");
      return;
    }

    createScheduleMutation.mutate({
      template_id: selectedTemplate.id,
      start_date: format(startDate, "yyyy-MM-dd"),
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  const templates = templatesData?.templates || [];
  const headerHeight = 80 + insets.top;

  // Calculate preview dates
  const previewDates = selectedTemplate
    ? selectedTemplate.gaps.map((gap) => addDays(startDate, gap))
    : [];

  return (
    <ScreenLayout>
      <ScreenHeader
        title="Create Schedule"
        subtitle="Schedule vaccination sessions"
        scrollY={scrollY}
      />

      {templates.length === 0 ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: headerHeight + 40,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 100,
            justifyContent: "center",
            minHeight: 600,
          }}
          showsVerticalScrollIndicator={false}
        >
          <EmptyState
            icon={CalendarIcon}
            title="No Templates Available"
            description="Create a template first before scheduling"
            buttonText="Create Template"
            onButtonPress={() => router.push("/(tabs)/templates/create")}
            iconSize={28}
          />
        </ScrollView>
      ) : (
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
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
        >
          {/* Select Template */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Select Template
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: theme.borderInput,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: theme.inputBackground,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setShowTemplatePicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: selectedTemplate ? theme.text : theme.textSecondary,
                }}
              >
                {selectedTemplate
                  ? selectedTemplate.disease_name
                  : "Choose a template"}
              </Text>
              <ChevronDown color={theme.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Select Start Date */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: "Inter_600SemiBold",
                color: theme.text,
                marginBottom: 8,
              }}
            >
              Start Date
            </Text>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: theme.borderInput,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                backgroundColor: theme.inputBackground,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: theme.text,
                }}
              >
                {format(startDate, "MMM dd, yyyy")}
              </Text>
              <CalendarIcon color={theme.textSecondary} size={20} />
            </TouchableOpacity>
          </View>

          {/* Preview */}
          {selectedTemplate && (
            <View
              style={{
                backgroundColor: theme.card,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.text,
                  marginBottom: 16,
                }}
              >
                Schedule Preview
              </Text>

              {previewDates.map((date, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: index < previewDates.length - 1 ? 1 : 0,
                    borderBottomColor: theme.borderLight,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: theme.surface,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        color: theme.text,
                      }}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_500Medium",
                        color: theme.text,
                      }}
                    >
                      Session {index + 1}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontFamily: "Inter_400Regular",
                        color: theme.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      Day {selectedTemplate.gaps[index]}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: theme.accent,
                    }}
                  >
                    {format(date, "MMM dd")}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Create Button */}
          {selectedTemplate && (
            <TouchableOpacity
              style={{
                backgroundColor: theme.accent,
                borderRadius: 16,
                paddingVertical: 16,
                marginTop: 24,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={handleCreateSchedule}
              disabled={createScheduleMutation.isPending}
              activeOpacity={0.8}
            >
              <CheckCircle2
                color="#FFFFFF"
                size={20}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Inter_600SemiBold",
                  color: "#FFFFFF",
                }}
              >
                {createScheduleMutation.isPending
                  ? "Creating..."
                  : "Create Schedule"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Template Picker Modal */}
      <Modal
        visible={showTemplatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTemplatePicker(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: theme.modalOverlay,
          }}
        >
          <View
            style={{
              backgroundColor: theme.modalBackground,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "60%",
            }}
          >
            <View
              style={{
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  color: theme.text,
                  textAlign: "center",
                }}
              >
                Select Template
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                  onPress={() => {
                    setSelectedTemplate(template);
                    setShowTemplatePicker(false);
                  }}
                >
                  <Text
                    style={{
                      fontFamily:
                        selectedTemplate?.id === template.id
                          ? "Inter_700Bold"
                          : "Inter_400Regular",
                      fontSize: 16,
                      color:
                        selectedTemplate?.id === template.id
                          ? theme.accent
                          : theme.text,
                    }}
                  >
                    {template.disease_name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {template.session_count} sessions
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: theme.border,
              }}
              onPress={() => setShowTemplatePicker(false)}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: theme.textSecondary,
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: theme.modalOverlay,
            }}
          >
            <View
              style={{
                backgroundColor: theme.modalBackground,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 18,
                  color: theme.text,
                  textAlign: "center",
                  marginBottom: 20,
                }}
              >
                Select Start Date
              </Text>

              <View style={{ marginBottom: 20 }}>
                {[0, 1, 2, 7, 14, 30].map((days) => {
                  const date = addDays(new Date(), days);
                  const isSelected =
                    format(startDate, "yyyy-MM-dd") ===
                    format(date, "yyyy-MM-dd");

                  return (
                    <TouchableOpacity
                      key={days}
                      style={{
                        padding: 16,
                        backgroundColor: isSelected
                          ? `${theme.accent}15`
                          : "transparent",
                        borderRadius: 12,
                        marginBottom: 8,
                        borderWidth: isSelected ? 1 : 0,
                        borderColor: theme.accent,
                      }}
                      onPress={() => {
                        setStartDate(date);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: isSelected
                            ? "Inter_600SemiBold"
                            : "Inter_400Regular",
                          fontSize: 16,
                          color: isSelected ? theme.accent : theme.text,
                        }}
                      >
                        {days === 0
                          ? "Today"
                          : days === 1
                            ? "Tomorrow"
                            : `${days} days from now`}{" "}
                        - {format(date, "MMM dd, yyyy")}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={{
                  padding: 16,
                  borderTopWidth: 1,
                  borderTopColor: theme.border,
                }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: theme.textSecondary,
                    textAlign: "center",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScreenLayout>
  );
}
