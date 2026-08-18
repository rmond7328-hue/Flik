import { supabase } from '../lib/supabase';

export async function listCountries() {
  return supabase.from('campuses').select('country').order('country');
}

export async function listCities(country: string) {
  return supabase.from('campuses').select('city').eq('country', country).order('city');
}

export async function listCampuses(country: string, city: string) {
  return supabase.from('campuses').select('*').eq('country', country).eq('city', city).order('name');
}

export async function listInterests() {
  return supabase.from('interests').select('*').order('name');
}

export async function saveInterests(userId: string, interestIds: string[]) {
  const { error: deleteError } = await supabase.from('profile_interests').delete().eq('profile_id', userId);
  if (deleteError) return { error: deleteError };
  if (!interestIds.length) return { error: null };
  return supabase.from('profile_interests').insert(
    interestIds.map((interest_id) => ({ profile_id: userId, interest_id }))
  );
}