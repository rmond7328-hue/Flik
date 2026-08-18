import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { listCampuses, listCities, listCountries } from '../../services/campus';
import { supabase } from '../../lib/supabase';

export default function CampusSetup() {
  const user = useAuthStore((s) => s.user);
  const [countries, setCountries] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [campusId, setCampusId] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { listCountries().then(({ data }) => setCountries([...new Set((data ?? []).map((x: any) => x.country))])); }, []);
  async function chooseCountry(value: string) {
    setCountry(value); setCity(''); setCampusId(''); setCampuses([]);
    const { data } = await listCities(value);
    setCities([...new Set((data ?? []).map((x: any) => x.city))]);
  }
  async function chooseCity(value: string) {
    setCity(value); setCampusId('');
    const { data } = await listCampuses(country, value);
    setCampuses(data ?? []);
  }
  async function next() {
    if (!user || !campusId) return Alert.alert('Choose your campus', 'Select a campus to continue.');
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ campus_id: campusId }).eq('id', user.id);
    setBusy(false);
    if (error) return Alert.alert('Could not save campus', error.message);
    router.push('/(onboarding)/interests');
  }

  return <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 70, gap: 14 }}>
    <Text style={{ fontSize: 32, fontWeight: '800' }}>Where do you study?</Text>
    <Text style={{ color: '#6B7280' }}>Your campus shapes what you see on Flik.</Text>
    <Text style={label}>Country</Text>
    <View style={wrap}>{countries.map((x) => <Pressable key={x} onPress={() => chooseCountry(x)} style={[chip, country === x && selected]}><Text>{x}</Text></Pressable>)}</View>
    {!!country && <><Text style={label}>City</Text><View style={wrap}>{cities.map((x) => <Pressable key={x} onPress={() => chooseCity(x)} style={[chip, city === x && selected]}><Text>{x}</Text></Pressable>)}</View></>}
    {!!city && <><Text style={label}>Campus</Text><View style={wrap}>{campuses.map((x) => <Pressable key={x.id} onPress={() => setCampusId(x.id)} style={[chip, campusId === x.id && selected]}><Text>{x.name}</Text></Pressable>)}</View></>}
    <Pressable onPress={next} disabled={busy} style={button}><Text style={buttonText}>{busy ? 'Saving…' : 'Continue'}</Text></Pressable>
  </ScrollView>;
}
const label = { fontWeight: '700' as const, marginTop: 10 };
const wrap = { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 };
const chip = { paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 999 };
const selected = { backgroundColor: '#DBEAFE', borderColor: '#60A5FA' };
const button = { height: 52, borderRadius: 14, backgroundColor: '#60A5FA', alignItems: 'center' as const, justifyContent: 'center' as const, marginTop: 16 };
const buttonText = { color: '#fff', fontSize: 16, fontWeight: '700' as const };