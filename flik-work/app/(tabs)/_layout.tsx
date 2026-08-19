import { Tabs } from 'expo-router';
import { House, UsersRound, Plus, MessageCircle, UserRound } from 'lucide-react-native';
import { colors } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accentStrong,
      tabBarInactiveTintColor: colors.subtle,
      tabBarLabelStyle: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, lineHeight: 13, marginTop: 1 },
      tabBarStyle: {
        height: 78,
        paddingTop: 8,
        paddingBottom: 11,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.white,
        elevation: 0,
      },
      tabBarItemStyle: { minHeight: 54 },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={2.15} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} strokeWidth={2.15} /> }} />
      <Tabs.Screen name="create" options={{
        title: 'Create',
        tabBarIcon: () => <Plus color={colors.white} size={24} strokeWidth={2.7} />,
        tabBarIconStyle: { backgroundColor: colors.accentStrong, borderRadius: 20, width: 42, height: 42, alignItems: 'center', justifyContent: 'center', marginTop: -7, marginBottom: 1 },
      }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} strokeWidth={2.15} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} strokeWidth={2.15} /> }} />
    </Tabs>
  );
}
