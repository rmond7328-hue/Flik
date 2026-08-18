import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { listInterests, saveInterests } from '../../services/campus';

export default function Interests() {
  const user = useAuthStore((s) => s.user);
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { listInterests().then(({ data }) => setItems(data ?? [])); }, []);
  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }
  async function finish() {
    if (!user || selected.length < 1) return Alert.alert('Pick an interest', 'Choose at least one interest so we can personalize your campus feed.');
    setBusy(true);
    const { error } = await saveInterests(user.id, selected);
    setBusy(false);
    if (error) return Alert.alert('Could not save interests', error.message);
    router.replace('/(tabs)/home');
  }

  return <View style={{ flex: 1, padding: 24, paddingTop: 70, gap: 14 }}>
    <Text style={{ fontSize: 32, fontWeight: '800' }}>What are you into?</Text>
    <Text style={{ color: '#6B7280' }}>Pick a few things you want to see around campus.</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>{items.map((x) => <Pressable key={x.id} onPress={() => toggle(x.id)} style={[chip, selected.includes(x.id) && active]}><Text style={{ fontWeight: '600' }}>{x.name}</Text></Pressable>)}</View>
    <Pressable onPress={finish} disabled={busy} style={button}><Text style={buttonText}>{busy ? 'Finishing…' : 'Enter Flik'}</Text></Pressable>
  </View>;
}
const chip = { paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999 };
const active = { backgroundColor: '#DBEAFE', borderColor: '#60A5FA' };
const button = { height: 52, borderRadius: 14, backgroundColor: '#60A5FA', alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: 'auto' as any };
const buttonText = { color: '#fff', fontSize: 16, fontWeight: '700' as const };