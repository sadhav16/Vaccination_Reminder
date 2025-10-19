import React, { useState } from "react";
import { View, Text, ScrollView, Animated, TouchableOpacity, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Calendar, Syringe } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

import ScreenLayout from "@/components/ScreenLayout";
import ScreenHeader from "@/components/ScreenHeader";
import EmptyState from "@/components/EmptyState";
import { useAppTheme } from "@/components/ThemeProvider";
import { useAppFonts } from "@/components/useFontLoader";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useAppTheme();
  const fontsLoaded = useAppFonts();
  const [scrollY] = useState(new Animated.Value(0));

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['upcoming-sessions'],
    queryFn: async () => {
      const response = await fetch('/api/sessions/upcoming');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      return response.json();
    },
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!fontsLoaded) {
    return null;
  }

  const sessions = data?.sessions || [];
  const headerHeight = 80 + insets.top;

  const getSessionHighlight = (sessionDate) => {
    const date = parseISO(sessionDate);
    if (isToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'none';
  };

  const formatSessionDate = (sessionDate) => {
    const date = parseISO(sessionDate);
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <ScreenLayout>
      <ScreenHeader
        title="Vaccination Schedule"
        subtitle="Upcoming sessions"
        scrollY={scrollY}
      />

      {sessions.length === 0 ? (
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
            icon={Calendar}
            title="No Upcoming Sessions"
            description="Create a vaccination schedule to get started"
            buttonText="Create Schedule"
            onButtonPress={() => router.push('/(tabs)/create-schedule')}
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
          {sessions.map((session) => {
            const highlight = getSessionHighlight(session.session_date);
            const isHighlighted = highlight !== 'none';

            return (
              <TouchableOpacity
                key={session.id}
                style={{
                  backgroundColor: isHighlighted 
                    ? (highlight === 'today' ? `${theme.accent}15` : `${theme.accent}08`)
                    : theme.card,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: isHighlighted ? 2 : 1,
                  borderColor: isHighlighted ? theme.accent : theme.border,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/schedule/${session.schedule_id}`)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
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
                    <Syringe color={theme.accent} size={22} />
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
                      {session.disease_name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter_400Regular",
                        color: theme.textSecondary,
                      }}
                    >
                      Session {session.session_number}
                    </Text>
                  </View>

                  {isHighlighted && (
                    <View
                      style={{
                        backgroundColor: theme.accent,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Inter_600SemiBold",
                          color: "#FFFFFF",
                        }}
                      >
                        {highlight === 'today' ? 'TODAY' : 'TOMORROW'}
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: theme.borderLight,
                  }}
                >
                  <Calendar color={theme.textSecondary} size={16} style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontFamily: "Inter_500Medium",
                      color: theme.textSecondary,
                    }}
                  >
                    {formatSessionDate(session.session_date)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </ScreenLayout>
  );
}