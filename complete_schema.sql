-- ============================================
-- COMPLETE DATABASE SCHEMA
-- Combined from all SQL files
-- ============================================

-- ============================================
-- 1. USERS TABLE
-- ============================================
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

-- ============================================
-- 2. DEPARTMENTS TABLE (for teams reference)
-- ============================================
create table if not exists departments (
    id serial primary key,
    name varchar(255) not null,
    description text,
    created_at timestamptz not null default now()
);

-- ============================================
-- 2A. ORGANIZATIONAL HIERARCHY EXTENSIONS
-- ============================================
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'users' and column_name = 'role_id'
    ) then
        alter table users add column role_id integer;
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'users' and column_name = 'department_id'
    ) then
        alter table users add column department_id integer references departments(id) on delete set null;
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'users' and column_name = 'position'
    ) then
        alter table users add column position varchar(100);
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'users' and column_name = 'status'
    ) then
        alter table users add column status varchar(30) default 'active';
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'users' and column_name = 'is_active'
    ) then
        alter table users add column is_active boolean not null default true;
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'users' and column_name = 'manager_id'
    ) then
        alter table users add column manager_id integer references users(id) on delete set null;
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'departments' and column_name = 'code'
    ) then
        alter table departments add column code varchar(50);
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'departments' and column_name = 'level'
    ) then
        alter table departments add column level integer default 1;
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'departments' and column_name = 'is_active'
    ) then
        alter table departments add column is_active boolean not null default true;
    end if;
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'departments' and column_name = 'manager_id'
    ) then
        alter table departments add column manager_id integer references users(id) on delete set null;
    end if;
end $$;

create unique index if not exists idx_departments_code on departments(code);

create table if not exists hierarchy_levels (
    id serial primary key,
    level_number integer unique not null,
    title varchar(255) not null,
    description text
);

create table if not exists roles (
    id serial primary key,
    name varchar(100) unique not null,
    description text
);

do $$
begin
    if not exists (
        select 1
        from information_schema.table_constraints
        where table_name = 'users'
          and constraint_name = 'users_role_id_fkey'
    ) then
        alter table users
        add constraint users_role_id_fkey
        foreign key (role_id) references roles(id) on delete set null;
    end if;
end $$;

create table if not exists positions (
    id serial primary key,
    name varchar(150) unique not null,
    description text,
    level integer not null,
    min_reports integer not null default 0,
    max_reports integer not null default 0,
    is_active boolean not null default true
);

create table if not exists management_assignments (
    id bigserial primary key,
    user_id integer not null references users(id) on delete cascade,
    department_id integer not null references departments(id) on delete cascade,
    assignment_type varchar(100) not null,
    assignment_date date not null default current_date,
    is_primary boolean not null default true,
    unique (user_id, department_id, assignment_type)
);

create table if not exists reporting_chains (
    id bigserial primary key,
    user_id integer not null references users(id) on delete cascade,
    direct_manager_id integer not null references users(id) on delete cascade,
    hierarchy_level_id integer not null references hierarchy_levels(id) on delete restrict,
    effective_date date not null default current_date,
    is_current boolean not null default true,
    unique (user_id, direct_manager_id, hierarchy_level_id, effective_date)
);

create table if not exists organizational_structure (
    id bigserial primary key,
    user_id integer not null references users(id) on delete cascade,
    department_id integer references departments(id) on delete set null,
    position_level integer not null,
    reporting_to_user_id integer references users(id) on delete set null,
    effective_date date not null default current_date,
    is_active boolean not null default true,
    unique (user_id, effective_date)
);

-- ============================================
-- 3. TEAMS TABLE
-- ============================================
create table if not exists teams (
    id bigserial primary key,
    team_code varchar(30) unique not null,
    name varchar(255) not null,
    department_id integer references departments(id) on delete set null,
    lead_user_id integer references users(id) on delete set null,
    description text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================
-- 4. TEAM MEMBERS TABLE
-- ============================================
create table if not exists team_members (
    id bigserial primary key,
    team_id bigint not null references teams(id) on delete cascade,
    user_id integer not null references users(id) on delete cascade,
    team_role varchar(100) not null,
    is_team_lead boolean not null default false,
    joined_at timestamptz not null default now(),
    left_at timestamptz,
    unique (team_id, user_id)
);

-- ============================================
-- 5. WORK ASSIGNMENTS TABLE
-- ============================================
create table if not exists work_assignments (
    id bigserial primary key,
    assignment_code varchar(30) unique not null,
    title varchar(255) not null,
    description text,
    assigned_by integer not null references users(id) on delete restrict,
    assigned_to integer not null references users(id) on delete restrict,
    team_id bigint references teams(id) on delete set null,
    priority varchar(20) not null default 'medium'
        check (priority in ('low', 'medium', 'high', 'critical')),
    status varchar(30) not null default 'pending'
        check (status in ('pending', 'in_progress', 'blocked', 'completed', 'overdue', 'cancelled')),
    visibility_scope varchar(20) not null default 'personal'
        check (visibility_scope in ('personal', 'team')),
    start_at timestamptz,
    due_at timestamptz not null,
    completed_at timestamptz,
    delivery_to_user_id integer references users(id) on delete set null,
    delivery_location varchar(255),
    delivery_channel varchar(100),
    expected_output text,
    latest_progress integer not null default 0 check (latest_progress between 0 and 100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================
-- 6. ASSIGNMENT UPDATES TABLE
-- ============================================
create table if not exists assignment_updates (
    id bigserial primary key,
    assignment_id bigint not null references work_assignments(id) on delete cascade,
    updated_by integer not null references users(id) on delete restrict,
    progress_percent integer not null default 0 check (progress_percent between 0 and 100),
    status varchar(30)
        check (status in ('pending', 'in_progress', 'blocked', 'completed', 'overdue', 'cancelled')),
    note text,
    attachment_url text,
    created_at timestamptz not null default now()
);

-- ============================================
-- 7. MEETINGS TABLE
-- ============================================
create table if not exists meetings (
    id bigserial primary key,
    meeting_id varchar(30) unique not null,
    title varchar(255) not null,
    status varchar(30) not null default 'Төлөвлөсөн'
        check (status in ('Төлөвлөсөн', 'Баталгаажсан', 'Цуцлагдсан')),
    organizer_id integer not null references users(id) on delete restrict,
    meeting_date timestamptz not null,
    location varchar(255),
    team_id bigint,
    manager_reaction varchar(50),
    manager_reaction_at timestamptz,
    manager_comment text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Add description column if it doesn't exist
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'meetings' and column_name = 'description'
    ) then
        alter table meetings add column description text;
    end if;
end $$;

-- Rename meeting_code to meeting_id if meeting_code exists
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_name = 'meetings' and column_name = 'meeting_code'
    ) then
        alter table meetings rename column meeting_code to meeting_id;
    end if;
end $$;

-- ============================================
-- 8. MEETING RECORDINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meeting_recordings (
    id SERIAL PRIMARY KEY,
    meeting_id VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    file_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,
    transcription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add transcription column if it doesn't exist
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'meeting_recordings' and column_name = 'transcription'
    ) then
        alter table meeting_recordings add column transcription TEXT;
    end if;
end $$;

-- Make user_id nullable if it's not already
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_name = 'meeting_recordings' and column_name = 'user_id' and is_nullable = 'NO'
    ) then
        alter table meeting_recordings alter column user_id drop not null;
    end if;
end $$;

-- ============================================
-- 9. INDEXES
-- ============================================
-- Users indexes
create index if not exists idx_users_email on users(email);

-- Teams indexes
create index if not exists idx_teams_department_id on teams(department_id);
create index if not exists idx_teams_lead_user_id on teams(lead_user_id);

-- Team members indexes
create index if not exists idx_team_members_user_id on team_members(user_id);
create index if not exists idx_team_members_team_id on team_members(team_id);

-- Work assignments indexes
create index if not exists idx_work_assignments_assigned_to on work_assignments(assigned_to);
create index if not exists idx_work_assignments_team_id on work_assignments(team_id);
create index if not exists idx_work_assignments_due_at on work_assignments(due_at);

-- Assignment updates indexes
create index if not exists idx_assignment_updates_assignment_id on assignment_updates(assignment_id);

-- Meetings indexes
create index if not exists idx_meetings_organizer_id on meetings(organizer_id);
create index if not exists idx_meetings_status on meetings(status);
create index if not exists idx_meetings_meeting_date on meetings(meeting_date);

-- Meeting recordings indexes
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_user_id ON meeting_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON users(manager_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_reporting_chains_user_id ON reporting_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_organizational_structure_user_id ON organizational_structure(user_id);

-- ============================================
-- 10. RLS POLICIES
-- ============================================
-- Teams RLS
alter table teams enable row level security;
create policy "Authenticated users can view teams"
  on teams for select
  to authenticated
  using (true);
create policy "Authenticated users can insert teams"
  on teams for insert
  to authenticated
  with check (true);
create policy "Authenticated users can update teams"
  on teams for update
  to authenticated
  using (true);

-- Team members RLS
alter table team_members enable row level security;
create policy "Authenticated users can view team_members"
  on team_members for select
  to authenticated
  using (true);
create policy "Authenticated users can insert team_members"
  on team_members for insert
  to authenticated
  with check (true);
create policy "Authenticated users can update team_members"
  on team_members for update
  to authenticated
  using (true);

-- Work assignments RLS
alter table work_assignments enable row level security;
create policy "Authenticated users can view work_assignments"
  on work_assignments for select
  to authenticated
  using (true);
create policy "Authenticated users can insert work_assignments"
  on work_assignments for insert
  to authenticated
  with check (true);
create policy "Authenticated users can update work_assignments"
  on work_assignments for update
  to authenticated
  using (true);

-- Assignment updates RLS
alter table assignment_updates enable row level security;
create policy "Authenticated users can view assignment_updates"
  on assignment_updates for select
  to authenticated
  using (true);
create policy "Authenticated users can insert assignment_updates"
  on assignment_updates for insert
  to authenticated
  with check (true);

-- Meetings RLS
alter table meetings enable row level security;
create policy "Authenticated users can insert meetings"
  on meetings for insert
  to authenticated
  with check (true);
create policy "Authenticated users can view meetings"
  on meetings for select
  to authenticated
  using (true);
create policy "Authenticated users can update meetings"
  on meetings for update
  to authenticated
  using (true);
create policy "Authenticated users can delete meetings"
  on meetings for delete
  to authenticated
  using (true);

-- Meeting recordings RLS
ALTER TABLE meeting_recordings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations on meeting_recordings" ON meeting_recordings;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON meeting_recordings;
DROP POLICY IF EXISTS "Enable all for anon" ON meeting_recordings;
DROP POLICY IF EXISTS "Enable insert for anon" ON meeting_recordings;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anon" 
ON meeting_recordings 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" 
ON meeting_recordings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ============================================
-- 11. TRIGGERS
-- ============================================
-- Create function for updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Users trigger
drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row
execute function update_updated_at_column();

-- Teams trigger
drop trigger if exists trg_teams_updated_at on teams;
create trigger trg_teams_updated_at
before update on teams
for each row
execute function update_updated_at_column();

-- Work assignments trigger
drop trigger if exists trg_work_assignments_updated_at on work_assignments;
create trigger trg_work_assignments_updated_at
before update on work_assignments
for each row
execute function update_updated_at_column();

-- Meetings trigger
drop trigger if exists trg_meetings_updated_at on meetings;
create trigger trg_meetings_updated_at
before update on meetings
for each row
execute function update_updated_at_column();

-- ============================================
-- 12. COMMENTS
-- ============================================
comment on table users is 'Нийтийн хэрэглэгчийн хүснэгт - auth.users-тай холбогдсон';
comment on table teams is 'Employee dashboard дээр харагдах багийн үндсэн мэдээлэл';
comment on table team_members is 'Ажилтан аль багт, ямар үүрэгтэйг хадгална';
comment on table work_assignments is 'Ажилтанд оноосон болон багт харагдах үндсэн даалгаврууд';
comment on table assignment_updates is 'Даалгаврын явц, тайлбар, биелэлтийн түүх';
comment on table meetings is 'Хурал, уулзалтын мэдээлэл - ажилтан үүсгэдэг, менежер харж, хариу өгдөг';
comment on table meeting_recordings is 'Хурлын бичлэг хадгалах хүснэгт';

-- ============================================
-- 13. TEST DATA (for development)
-- ============================================
-- Insert test user with id=1
INSERT INTO public.users (id, email, name, role) 
OVERRIDING SYSTEM VALUE
VALUES (1, 'test@example.com', 'Test User', 'manager')
ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    name = excluded.name,
    role = excluded.role;

insert into public.hierarchy_levels (level_number, title, description)
values
  (1, 'Executive Director', 'Top-level strategic leadership'),
  (2, 'Director', 'Senior strategic leadership'),
  (3, 'Manager', 'Middle management - coordinates all departments'),
  (4, 'Department Head', 'Leads and manages individual department'),
  (5, 'Team Leader', 'Leads teams within a department'),
  (6, 'Employee', 'Individual contributor')
on conflict (level_number) do nothing;

insert into public.roles (name, description)
values
  ('admin', 'System administrator'),
  ('director', 'Executive director overseeing organization'),
  ('manager', 'Central manager coordinating departments'),
  ('department_head', 'Head of department'),
  ('team_leader', 'Leader of team within department'),
  ('employee', 'Individual contributor')
on conflict (name) do nothing;

insert into public.positions (name, description, level, min_reports, max_reports, is_active)
values
  ('Director', 'Executive director position', 2, 1, 5, true),
  ('Manager', 'Central manager coordinating all departments', 3, 6, 6, true),
  ('Department Head', 'Head of individual department', 4, 1, 10, true),
  ('Team Leader', 'Leader of a team', 5, 1, 8, true),
  ('Employee', 'Individual contributor', 6, 0, 0, true)
on conflict (name) do nothing;

insert into public.departments (name, code, description, level, is_active)
values
  ('Finance Department', 'DEPT_FIN', 'Financial management and accounting', 1, true),
  ('Human Resources Department', 'DEPT_HR', 'Human resources and personnel', 1, true),
  ('Operations Department', 'DEPT_OPS', 'Business operations and logistics', 1, true),
  ('Sales Department', 'DEPT_SALES', 'Sales and business development', 1, true),
  ('Marketing Department', 'DEPT_MKT', 'Marketing and communications', 1, true),
  ('Technology Department', 'DEPT_TECH', 'Information technology and systems', 1, true)
on conflict (code) do nothing;

insert into public.teams (team_code, name, department_id, description, is_active)
select
  replace(code, 'DEPT_', 'TEAM_'),
  replace(name, 'Department', 'Team'),
  id,
  'Primary operational team for ' || name,
  true
from public.departments
where code in ('DEPT_FIN', 'DEPT_HR', 'DEPT_OPS', 'DEPT_SALES', 'DEPT_MKT', 'DEPT_TECH')
on conflict (team_code) do nothing;

-- ============================================
-- 14. STORAGE BUCKET NOTE
-- ============================================
-- Create storage bucket for meeting recordings in Supabase dashboard:
-- Go to: Storage > New Bucket > Name: "meeting-recordings", Public: true
-- Buckets can only be created via Supabase dashboard or API, not via SQL
