-- Meetings table for employee and manager dashboards
-- This schema allows employees to create meetings and managers to view and react/approve them

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

-- Drop meeting_id column if it exists and is null (cleanup from previous migration)
do $$
begin
    if exists (
        select 1 from information_schema.columns
        where table_name = 'meetings' and column_name = 'meeting_id'
    ) then
        alter table meetings drop column if exists meeting_id;
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

-- Indexes for faster lookups
create index if not exists idx_meetings_organizer_id on meetings(organizer_id);
create index if not exists idx_meetings_status on meetings(status);
create index if not exists idx_meetings_meeting_date on meetings(meeting_date);

-- RLS Policies for meetings
alter table meetings enable row level security;

-- Allow authenticated users to insert meetings
create policy "Authenticated users can insert meetings"
  on meetings for insert
  to authenticated
  with check (true);

-- Allow authenticated users to view all meetings
create policy "Authenticated users can view meetings"
  on meetings for select
  to authenticated
  using (true);

-- Allow authenticated users to update meetings
create policy "Authenticated users can update meetings"
  on meetings for update
  to authenticated
  using (true);

-- Allow authenticated users to delete meetings
create policy "Authenticated users can delete meetings"
  on meetings for delete
  to authenticated
  using (true);

-- Create function for updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Update trigger for updated_at
drop trigger if exists trg_meetings_updated_at on meetings;
create trigger trg_meetings_updated_at
before update on meetings
for each row
execute function update_updated_at_column();

comment on table meetings is 'Хурал, уулзалтын мэдээлэл - ажилтан үүсгэдэг, менежер харж, хариу өгдөг';
