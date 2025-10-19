import React, { useState } from "react";
import { View, Text, ScrollView, Animated, TouchableOpacity, Alert, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FileText, Plus, Trash2 } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import ScreenLayout from "@/components/ScreenLayout";
import ScreenHeader from "@/components/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { useAppTheme } from "@/components/ThemeProvider";
import { useAppFonts } from "@/components/useFontLoader";

export default function TemplatesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useAppTheme();
  const fontsLoaded = useAppFonts();
  const [scrollY] = useState(new Animated.Value(0));
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates']);
    },
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDelete = (template) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete ${template.disease_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(template.id),
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  const templates = data?.templates || [];
  const headerHeight = 80 + insets.top;

  return (
    <ScreenLayout>
      <ScreenHeader
        title="Templates"
        subtitle="Manage vaccination templates"
        scrollY={scrollY}
        rightContent={
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: theme.accent,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => router.push('/(tabs)/templates/create')}
            activeOpacity={0.8}
          >
            <Plus color="#FFFFFF" size={22} />
          </TouchableOpacity>
        }
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <EmptyState
            icon={FileText}
            title="No Templates"
            description="Create your first vaccination template"
            buttonText="Create Template"
            onButtonPress={() => router.push('/(tabs)/templates/create')}
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
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {templates.map((template) => (
            <View
              key={template.id}
              style={{
                backgroundColor: theme.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${theme.accent}15`,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <FileText color={theme.accent} size={22} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Inter_600SemiBold",
                      color: theme.text,
                      marginBottom: 2,
                    }}
                  >
                    {template.disease_name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_400Regular",
                      color: theme.textSecondary,
                    }}
                  >
                    {template.session_count} sessions
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: `${theme.accent}10`,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => handleDelete(template)}
                  activeOpacity={0.7}
                >
                  <Trash2 color={theme.accent} size={18} />
                </TouchableOpacity>
              </View>

              <View
                style={{
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: theme.borderLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Inter_500Medium",
                    color: theme.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Session Schedule (days):
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {template.gaps.map((gap, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: theme.surface,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: "Inter_600SemiBold",
                          color: theme.text,
                        }}
                      >
                        Day {gap}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}