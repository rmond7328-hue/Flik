import { supabase } from '../lib/supabase';
export async function getMyProfile(userId:string){return supabase.from('profiles').select('*,campuses(*)').eq('id',userId).maybeSingle();}
export async function updateProfile(userId:string,values:{full_name:string;username:string;bio:string;avatar_path?:string|null}){return supabase.from('profiles').update(values).eq('id',userId).select().single();}
export async function usernameAvailable(username:string,currentUserId?:string){let q=supabase.from('profiles').select('id').eq('username',username).limit(1);if(currentUserId)q=q.neq('id',currentUserId);const {data,error}=await q.maybeSingle();return {available:!data&&!error,error};}
