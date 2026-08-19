import { Tabs } from 'expo-router';
import { House, UsersRound, Plus, MessageCircle, UserRound } from 'lucide-react-native';
import { colors } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accentStrong,
      tabBarInactiveTintColor: colors.subtle,
      tabBarLabelStyle: { fontFamily: 'DMSans_600SemiBold', fontSize: 10, lineHeight: 13, marginTop: 2 },
      tabBarStyle: {
        height: 82,
        paddingTop: 7,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.white,
        elevation: 0,
      },
      tabBarItemStyle: { minHeight: 55 },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={2.15} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} strokeWidth={2.15} /> }} />
      <Tabs.Screen name="create" options={{
        title: 'Create',
        tabBarIcon: () => <Plus color={colors.white} size={24} strokeWidth={2.7} />,
        tabBarIconStyle: { backgroundColor: colors.accentStrong, borderRadius: 21, width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: -8, marginBottom: 1 },
      }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} strokeWidth={2.15} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} strokeWidth={2.15} /> }} />
    </Tabs>
  );
}
