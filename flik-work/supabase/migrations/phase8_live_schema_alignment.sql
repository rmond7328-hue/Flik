-- Phase 8: align notification triggers/policies with the live profile_id/recipient_id schema.
create or replace function public.notify_follow_flk() returns trigger language plpgsql security definer set search_path=public as $$ begin if new.follower_id is distinct from new.following_id then insert into public.notifications(recipient_id,actor_id,type,created_at) values(new.following_id,new.follower_id,'follow',now()); end if; return new; end; $$;

create or replace function public.notify_like_flk() returns trigger language plpgsql security definer set search_path=public as $$ declare owner_id uuid; begin select author_id into owner_id from public.posts where id=new.post_id; if owner_id is not null and owner_id is distinct from new.profile_id then insert into public.notifications(recipient_id,actor_id,type,post_id,created_at) values(owner_id,new.profile_id,'like',new.post_id,now()); end if; return new; end; $$;

create or replace function public.notify_comment_flk() returns trigger language plpgsql security definer set search_path=public as $$ declare owner_id uuid; begin select author_id into owner_id from public.posts where id=new.post_id; if owner_id is not null and owner_id is distinct from new.author_id then insert into public.notifications(recipient_id,actor_id,type,post_id,created_at) values(owner_id,new.author_id,'comment',new.post_id,now()); end if; return new; end; $$;

drop trigger if exists follows_notification on public.follows;
create trigger follows_notification after insert on public.follows for each row execute function public.notify_follow_flk();
drop trigger if exists likes_notification on public.likes;
create trigger likes_notification after insert on public.likes for each row execute function public.notify_like_flk();
drop trigger if exists comments_notification on public.comments;
create trigger comments_notification after insert on public.comments for each row execute function public.notify_comment_flk();

alter table public.notifications enable row level security;
drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self on public.notifications for select to authenticated using ((select auth.uid())=recipient_id);
drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications for update to authenticated using ((select auth.uid())=recipient_id) with check ((select auth.uid())=recipient_id);

create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id,created_at desc);
