-- Phase 6: server-side direct conversation creation.
-- This prevents the mobile client from directly creating arbitrary conversation membership.
create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  existing_id uuid;
  new_id uuid;
begin
  if me is null then raise exception 'Authentication required'; end if;
  if other_user_id is null or other_user_id = me then raise exception 'Invalid recipient'; end if;

  select cm1.conversation_id into existing_id
  from public.conversation_members cm1
  join public.conversation_members cm2 on cm2.conversation_id = cm1.conversation_id
  where cm1.user_id = me and cm2.user_id = other_user_id
    and (select count(*) from public.conversation_members cm3 where cm3.conversation_id = cm1.conversation_id) = 2
  limit 1;

  if existing_id is not null then return existing_id; end if;

  insert into public.conversations default values returning id into new_id;
  insert into public.conversation_members(conversation_id,user_id)
  values (new_id, me), (new_id, other_user_id);
  return new_id;
end;
$$;

revoke all on function public.get_or_create_direct_conversation(uuid) from public;
revoke all on function public.get_or_create_direct_conversation(uuid) from anon;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

drop policy if exists conversations_insert_auth on public.conversations;
drop policy if exists conversation_members_insert_self on public.conversation_members;
