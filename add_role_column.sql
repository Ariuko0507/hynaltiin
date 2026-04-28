-- Add role column to users table if it doesn't exist
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'users' and table_schema = 'public' and column_name = 'role'
    ) then
        alter table public.users add column role text default 'employee';
    end if;
end $$;
