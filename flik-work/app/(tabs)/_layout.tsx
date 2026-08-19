import { Tabs } from 'expo-router';
import { House, UsersRound, Plus, MessageCircle, UserRound } from 'lucide-react-native';
import { colors, spacing } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accentStrong,
      tabBarInactiveTintColor: colors.subtle,
      tabBarLabelStyle: { fontFamily: 'DM Sans', fontSize: 11, fontWeight: '600', marginTop: -2 },
      tabBarStyle: {
        height: 76,
        paddingTop: 9,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.white,
        elevation: 0,
      },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ color }) => <Plus color={colors.white} size={24} strokeWidth={2.6} />, tabBarIconStyle: { backgroundColor: colors.accentStrong, borderRadius: 18, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 2 } }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} strokeWidth={2.2} /> }} />
    </Tabs>
  );
}
