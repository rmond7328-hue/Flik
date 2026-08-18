import { supabase } from '../lib/supabase';

export async function searchPeople(q: string, campusId?: string, viewerId?: string) {
  let query = supabase.from('profiles').select('id,username,full_name,bio,avatar_path,campus_id,campuses(id,name,city)').or(`username.ilike.%${q}%,full_name.ilike.%${q}%`).limit(30);
  if (campusId) query = query.eq('campus_id', campusId);
  if (viewerId) { const blocked = await supabase.from('blocks').select('blocked_id').eq('blocker_id', viewerId); const ids=(blocked.data||[]).map(x=>x.blocked_id); if(ids.length) query=query.not('id','in',`(${ids.join(',')})`); }
  return query;
}
export async function searchCommunities(q: string, campusId?: string) {
  let query = supabase.from('communities').select('id,name,slug,description,avatar_path,cover_path,member_count,campus_id,visibility').or(`name.ilike.%${q}%,description.ilike.%${q}%`).limit(30);
  if (campusId) query = query.eq('campus_id', campusId);
  return query;
}
export async function searchPosts(q: string, campusId?: string) {
  let query = supabase.from('posts').select('id,content,created_at,author_id,campus_id,community_id,profiles:author_id(id,username,full_name,avatar_path),communities:community_id(id,name)').ilike('content', `%${q}%`).order('created_at',{ascending:false}).limit(30);
  if (campusId) query = query.eq('campus_id', campusId);
  return query;
}
export async function followUser(followerId:string, followingId:string) { return supabase.from('follows').insert({follower_id:followerId,following_id:followingId}); }
export async function unfollowUser(followerId:string, followingId:string) { return supabase.from('follows').delete().eq('follower_id',followerId).eq('following_id',followingId); }
export async function isFollowing(followerId:string, followingId:string) { return supabase.from('follows').select('follower_id').eq('follower_id',followerId).eq('following_id',followingId).maybeSingle(); }
export async function getProfile(userId:string) { return supabase.from('profiles').select('id,username,full_name,bio,avatar_path,campus_id,campuses(id,name,city,country)').eq('id',userId).single(); }
export async function getFollowCounts(userId:string) { const [a,b]=await Promise.all([supabase.from('follows').select('*',{count:'exact',head:true}).eq('following_id',userId),supabase.from('follows').select('*',{count:'exact',head:true}).eq('follower_id',userId)]); return {followers:a.count??0,following:b.count??0}; }
export async function getUserPosts(userId:string) { return supabase.from('posts').select('id,content,created_at,author_id,community_id,campus_id,post_media(id,media_type,storage_path,sort_order),communities:community_id(id,name)').eq('author_id',userId).order('created_at',{ascending:false}).limit(50); }
export async function listFollowers(userId:string){return supabase.from('follows').select('follower_id,profiles:follower_id(id,username,full_name,avatar_path,campus_id)').eq('following_id',userId).order('created_at',{ascending:false});}
export async function listFollowing(userId:string){return supabase.from('follows').select('following_id,profiles:following_id(id,username,full_name,avatar_path,campus_id)').eq('follower_id',userId).order('created_at',{ascending:false});}
export async function savePost(profileId:string,postId:string){return supabase.from('saves').insert({profile_id:profileId,post_id:postId});}
export async function unsavePost(profileId:string,postId:string){return supabase.from('saves').delete().eq('profile_id',profileId).eq('post_id',postId);}
export async function isPostSaved(profileId:string,postId:string){return supabase.from('saves').select('post_id').eq('profile_id',profileId).eq('post_id',postId).maybeSingle();}
export async function listSavedPosts(profileId:string){return supabase.from('saves').select('post_id,created_at,posts(id,content,created_at,author_id,campus_id,community_id,profiles:author_id(id,username,full_name,avatar_path),communities:community_id(id,name),post_media(id,media_type,storage_path,sort_order))').eq('profile_id',profileId).order('created_at',{ascending:false});}
export async function blockUser(blockerId:string,blockedId:string){return supabase.from('blocks').insert({blocker_id:blockerId,blocked_id:blockedId});}
export async function unblockUser(blockerId:string,blockedId:string){return supabase.from('blocks').delete().eq('blocker_id',blockerId).eq('blocked_id',blockedId);}
export async function isBlocked(blockerId:string,blockedId:string){return supabase.from('blocks').select('blocked_id').eq('blocker_id',blockerId).eq('blocked_id',blockedId).maybeSingle();}
export async function listBlocked(blockerId:string){return supabase.from('blocks').select('blocked_id,profiles:blocked_id(id,username,full_name,avatar_path)').eq('blocker_id',blockerId);}
export async function reportTarget(reporterId:string,targetType:'post'|'comment'|'user'|'community',targetId:string,reason:string){return supabase.from('reports').insert({reporter_id:reporterId,target_type:targetType,target_id:targetId,reason});}
export async function uploadAvatar(uri:string,userId:string,mimeType='image/jpeg') { const response=await fetch(uri); const blob=await response.blob(); const ext=mimeType.split('/')[1]||'jpg'; const path=`${userId}/avatar-${Date.now()}.${ext}`; const {error}=await supabase.storage.from('avatars').upload(path,blob,{contentType:mimeType,upsert:false}); if(error)return {data:null,error}; const {data}=supabase.storage.from('avatars').getPublicUrl(path); return {data:{path,url:data.publicUrl},error:null}; }
