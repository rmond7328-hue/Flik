import { supabase } from './supabase';
export function publicStorageUrl(bucket:string,path?:string|null){if(!path)return undefined;return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;}
