-- Create public.users table to reference auth.users
-- This allows foreign key constraints from other tables

create table if not exists users (
    id integer primary key references auth.users(id) on delete cascade,
    email text unique not null,
    name text,
    role text default 'employee',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS
alter table users enable row level security;

-- Allow authenticated users to view users
create policy "Authenticated users can view users"
  on users for select
  to authenticated
  using (true);

-- Allow authenticated users to insert users
create policy "Authenticated users can insert users"
  on users for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update users
create policy "Authenticated users can update users"
  on users for update
  to authenticated
  using (true);

-- Function to sync auth.users to public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', coalesce(new.raw_user_meta_data->>'role', 'employee'))
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create user record on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
