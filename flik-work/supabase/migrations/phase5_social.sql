-- Flik Phase 5 additive social schema.
create extension if not exists pgcrypto;

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows(following_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('like','comment','follow','community')),
  post_id uuid references public.posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  community_id uuid references public.communities(id) on delete cascade,
  message text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_created_idx on public.notifications(user_id,created_at desc);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id,user_id)
);
create index if not exists conversation_members_user_idx on public.conversation_members(user_id);
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  status text not null default 'sent' check (status in ('sending','sent','failed')),
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id,created_at);

alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

drop policy if exists follows_select_authenticated on public.follows;
create policy follows_select_authenticated on public.follows for select to authenticated using (true);
drop policy if exists follows_insert_self on public.follows;
create policy follows_insert_self on public.follows for insert to authenticated with check (auth.uid()=follower_id);
drop policy if exists follows_delete_self on public.follows;
create policy follows_delete_self on public.follows for delete to authenticated using (auth.uid()=follower_id);

drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self on public.notifications for select to authenticated using (auth.uid()=user_id);
drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

-- Conversations: a member can see and create membership for themselves; membership insertion is limited to the authenticated user.
drop policy if exists conversations_select_member on public.conversations;
create policy conversations_select_member on public.conversations for select to authenticated using (exists(select 1 from public.conversation_members cm where cm.conversation_id=id and cm.user_id=auth.uid()));
drop policy if exists conversations_insert_auth on public.conversations;
create policy conversations_insert_auth on public.conversations for insert to authenticated with check (true);
drop policy if exists conversation_members_select_member on public.conversation_members;
create policy conversation_members_select_member on public.conversation_members for select to authenticated using (exists(select 1 from public.conversation_members me where me.conversation_id=conversation_id and me.user_id=auth.uid()));
drop policy if exists conversation_members_insert_self on public.conversation_members;
create policy conversation_members_insert_self on public.conversation_members for insert to authenticated with check (auth.uid()=user_id);
drop policy if exists conversation_members_delete_self on public.conversation_members;
create policy conversation_members_delete_self on public.conversation_members for delete to authenticated using (auth.uid()=user_id);

drop policy if exists messages_select_member on public.messages;
create policy messages_select_member on public.messages for select to authenticated using (exists(select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));
drop policy if exists messages_insert_member on public.messages;
create policy messages_insert_member on public.messages for insert to authenticated with check (auth.uid()=sender_id and exists(select 1 from public.conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));

-- Notification triggers: real likes/comments/follows generate notifications without trusting the client.
create or replace function public.notify_follow() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into notifications(user_id,actor_id,type,message) values(new.following_id,new.follower_id,'follow','started following you'); return new; end; $$;
drop trigger if exists follows_notification on public.follows;
create trigger follows_notification after insert on public.follows for each row execute function public.notify_follow();

create or replace function public.notify_like() returns trigger language plpgsql security definer set search_path=public as $$
declare owner uuid; begin select author_id into owner from posts where id=new.post_id; if owner is not null and owner<>new.user_id then insert into notifications(user_id,actor_id,type,post_id,message) values(owner,new.user_id,'like',new.post_id,'liked your post'); end if; return new; end; $$;
drop trigger if exists likes_notification on public.likes;
create trigger likes_notification after insert on public.likes for each row execute function public.notify_like();

create or replace function public.notify_comment() returns trigger language plpgsql security definer set search_path=public as $$
declare owner uuid; begin select author_id into owner from posts where id=new.post_id; if owner is not null and owner<>new.author_id then insert into notifications(user_id,actor_id,type,post_id,comment_id,message) values(owner,new.author_id,'comment',new.post_id,new.id,'commented on your post'); end if; return new; end; $$;
drop trigger if exists comments_notification on public.comments;
create trigger comments_notification after insert on public.comments for each row execute function public.notify_comment();

-- Enable Realtime for phase-5 streams. If already present in publication, PostgreSQL will reject duplicates; use the Supabase dashboard instead if needed.
