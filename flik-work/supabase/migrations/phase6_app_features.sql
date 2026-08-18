-- Flik Phase 6/7 app features. This mirrors the live project's additive changes.
-- The mobile app remains portable: these tables are infrastructure, not UI contracts.
alter table public.communities add column if not exists visibility text not null default 'public' check (visibility in ('public','private'));
alter table public.communities add column if not exists rules text not null default '';
alter table public.communities add column if not exists created_by uuid references public.profiles(id) on delete set null;
alter table public.communities add column if not exists member_count integer not null default 0;
alter table public.community_members add column if not exists status text not null default 'active' check (status in ('pending','active'));
alter table public.community_members add column if not exists role text not null default 'member' check (role in ('member','moderator','admin'));
create table if not exists public.saves (profile_id uuid not null references public.profiles(id) on delete cascade, post_id uuid not null references public.posts(id) on delete cascade, created_at timestamptz not null default now(), primary key(profile_id,post_id));
create table if not exists public.blocks (blocker_id uuid not null references public.profiles(id) on delete cascade, blocked_id uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id));
create table if not exists public.reports (id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade, target_type text not null check(target_type in ('post','comment','user','community')), target_id uuid not null, reason text not null, created_at timestamptz not null default now(), unique(reporter_id,target_type,target_id));
create table if not exists public.community_pinned_posts (community_id uuid not null references public.communities(id) on delete cascade, post_id uuid not null references public.posts(id) on delete cascade, pinned_by uuid not null references public.profiles(id) on delete cascade, created_at timestamptz not null default now(), primary key(community_id,post_id));
alter table public.messages add column if not exists read_at timestamptz;
alter table public.conversations add column if not exists last_message_at timestamptz;
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check(type in ('like','comment','follow','community','message','game_challenge','game_result'));
create table if not exists public.tictactoe_games (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade, challenger_id uuid not null references public.profiles(id) on delete cascade, opponent_id uuid not null references public.profiles(id) on delete cascade, board text[] not null default array['','','','','','','','',''], turn_user_id uuid not null references public.profiles(id), winner_id uuid references public.profiles(id), status text not null default 'active' check(status in ('active','draw','won','declined','abandoned')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(challenger_id<>opponent_id));
create table if not exists public.device_push_tokens (profile_id uuid not null references public.profiles(id) on delete cascade, token text not null, platform text not null check(platform in ('ios','android')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), primary key(profile_id,token));

-- Private community posts are only visible to active members (plus their author).
drop policy if exists posts_select_authenticated on public.posts;
create policy posts_select_authenticated on public.posts for select to authenticated using(author_id=(select auth.uid()) or community_id is null or exists(select 1 from public.communities c where c.id=posts.community_id and c.visibility='public') or exists(select 1 from public.community_members cm where cm.community_id=posts.community_id and cm.profile_id=(select auth.uid()) and cm.status='active'));
drop policy if exists posts_insert_self on public.posts;
create policy posts_insert_self on public.posts for insert to authenticated with check(author_id=(select auth.uid()) and (community_id is null or exists(select 1 from public.communities c where c.id=posts.community_id and c.visibility='public') or exists(select 1 from public.community_members cm where cm.community_id=posts.community_id and cm.profile_id=(select auth.uid()) and cm.status='active')));
alter table public.device_push_tokens enable row level security;
create policy push_tokens_select_self on public.device_push_tokens for select to authenticated using(profile_id=(select auth.uid()));
create policy push_tokens_insert_self on public.device_push_tokens for insert to authenticated with check(profile_id=(select auth.uid()));
create policy push_tokens_delete_self on public.device_push_tokens for delete to authenticated using(profile_id=(select auth.uid()));
