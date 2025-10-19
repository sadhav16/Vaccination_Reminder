import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Circle, Calendar as CalendarIcon } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isPast, isToday } from "date-fns";

import ScreenLayout from "@/components/ScreenLayout";
import ScreenHeader from "@/components/ScreenHeader";
import { useAppTheme } from "@/components/ThemeProvider";
import { useAppFonts } from "@/components/useFontLoader";

export default function ScheduleDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useAppTheme();
  const fontsLoaded = useAppFonts();
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [scrollY] = useState(new Animated.Value(0));

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', id],
    queryFn: async () => {
      const response = await fetch('/api/schedules');
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      const result = await response.json();
      return result.schedules.find(s => s.id === parseInt(id));
    },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ sessionId, isCompleted }) => {
      if (isCompleted) {
        const response = await fetch(`/api/sessions/complete?session_id=${sessionId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to uncomplete session');
        return response.json();
      } else {
        const response = await fetch('/api/sessions/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (!response.ok) throw new Error('Failed to complete session');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['schedule', id]);
      queryClient.invalidateQueries(['upcoming-sessions']);
    },
  });

  if (!fontsLoaded || isLoading) {
    return null;
  }

  const schedule = data;
  if (!schedule) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text }}>Schedule not found</Text>
        </View>
      </ScreenLayout>
    );
  }

  const sessions = schedule.sessions || [];
  const completedCount = sessions.filter(s => s.is_completed).length;
  const totalCount = sessions.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const headerHeight = 80 + insets.top;

  return (
    <ScreenLayout>
      <ScreenHeader
        title={schedule.disease_name}
        subtitle={`${completedCount} of ${totalCount} completed`}
        showBackButton={true}
        scrollY={scrollY}
      />

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
        {/* Progress Card */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Inter_500Medium",
              color: theme.textSecondary,
              marginBottom: 12,
            }}
          >
            Overall Progress
          </Text>

          <View
            style={{
              height: 8,
              backgroundColor: theme.surface,
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: theme.accent,
              }}
            />
          </View>

          <Text
            style={{
              fontSize: 24,
              fontFamily: "Inter_700Bold",
              color: theme.text,
            }}
          >
            {Math.round(progressPercent)}%
          </Text>
        </View>

        {/* Sessions Timeline */}
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
            Sessions
          </Text>

          {sessions.map((session, index) => {
            const sessionDate = parseISO(session.session_date);
            const isPastSession = isPast(sessionDate) && !isToday(sessionDate);
            const isTodaySession = isToday(sessionDate);

            return (
              <TouchableOpacity
                key={session.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  borderBottomWidth: index < sessions.length - 1 ? 1 : 0,
                  borderBottomColor: theme.borderLight,
                  opacity: session.is_completed ? 0.7 : 1,
                }}
                onPress={() => completeMutation.mutate({
                  sessionId: session.id,
                  isCompleted: session.is_completed,
                })}
                activeOpacity={0.7}
              >
                {/* Checkbox */}
                <View style={{ marginRight: 16 }}>
                  {session.is_completed ? (
                    <CheckCircle2 color={theme.accent} size={28} />
                  ) : (
                    <Circle color={theme.textSecondary} size={28} />
                  )}
                </View>

                {/* Session Info */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: "Inter_600SemiBold",
                        color: theme.text,
                        textDecorationLine: session.is_completed ? 'line-through' : 'none',
                      }}
                    >
                      Session {session.session_number}
                    </Text>
                    {isTodaySession && !session.is_completed && (
                      <View
                        style={{
                          backgroundColor: theme.accent,
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 8,
                          marginLeft: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: "Inter_600SemiBold",
                            color: "#FFFFFF",
                          }}
                        >
                          TODAY
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CalendarIcon
                      color={theme.textSecondary}
                      size={14}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: theme.textSecondary,
                      }}
                    >
                      {format(sessionDate, 'MMM dd, yyyy')}
                    </Text>
                  </View>
                </View>

                {/* Status */}
                {session.is_completed && (
                  <View
                    style={{
                      backgroundColor: `${theme.accent}15`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                        color: theme.accent,
                      }}
                    >
                      Done
                    </Text>
                  </View>
                )}
                {!session.is_completed && isPastSession && (
                  <View
                    style={{
                      backgroundColor: theme.surface,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Inter_600SemiBold",
                        color: theme.textSecondary,
                      }}
                    >
                      Missed
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}