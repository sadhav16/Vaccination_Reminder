import { Tabs } from 'expo-router';
import { Home, FileText, Plus } from 'lucide-react-native';
import { useAppTheme } from '@/components/ThemeProvider';

export default function TabLayout() {
  const { theme } = useAppTheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderColor: theme.border,
          paddingTop: 4,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.iconColor,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Home color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="templates/index"
        options={{
          title: 'Templates',
          tabBarIcon: ({ color }) => (
            <FileText color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-schedule"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <Plus color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="templates/create"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}