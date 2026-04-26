-- Employee dashboard tables for Supabase
-- This schema is focused on:
-- 1. Employee profile and team membership
-- 2. Personal work assignments
-- 3. Team-visible assignments
-- 4. Progress / history updates for each assignment

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

create index if not exists idx_team_members_user_id on team_members(user_id);
create index if not exists idx_work_assignments_assigned_to on work_assignments(assigned_to);
create index if not exists idx_work_assignments_team_id on work_assignments(team_id);
create index if not exists idx_work_assignments_due_at on work_assignments(due_at);
create index if not exists idx_assignment_updates_assignment_id on assignment_updates(assignment_id);

create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_teams_updated_at on teams;
create trigger trg_teams_updated_at
before update on teams
for each row
execute function update_updated_at_column();

drop trigger if exists trg_work_assignments_updated_at on work_assignments;
create trigger trg_work_assignments_updated_at
before update on work_assignments
for each row
execute function update_updated_at_column();

comment on table teams is 'Employee dashboard дээр харагдах багийн үндсэн мэдээлэл';
comment on table team_members is 'Ажилтан аль багт, ямар үүрэгтэйг хадгална';
comment on table work_assignments is 'Ажилтанд оноосон болон багт харагдах үндсэн даалгаврууд';
comment on table assignment_updates is 'Даалгаврын явц, тайлбар, биелэлтийн түүх';

-- Optional seed example
-- insert into teams (team_code, name, department_id, lead_user_id, description)
-- values ('TEAM-001', 'Баримт шалгалтын баг', 4, 3, 'Employee dashboard demo team');