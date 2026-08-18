import { supabase } from '../lib/supabase';
export async function listNotifications(userId:string){return supabase.from('notifications').select('id,type,actor_id,post_id,community_id,message,read_at,created_at,profiles:actor_id(id,username,full_name,avatar_path)').eq('recipient_id',userId).order('created_at',{ascending:false}).limit(100);}
export async function markNotificationRead(id:string){return supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id);}
export async function markAllNotificationsRead(userId:string){return supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('recipient_id',userId).is('read_at',null);}
