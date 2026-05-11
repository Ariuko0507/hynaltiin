-- ============================================================================
-- ORGANIZATIONAL STRUCTURE SETUP FOR CURRENT NEXT.JS + SUPABASE SCHEMA
-- ============================================================================
-- This script keeps the existing app schema intact and adds hierarchy metadata
-- that matches the Director -> Manager -> Department Head -> Team Leader model.
--
-- Important:
-- 1. public.users.id still references auth.users(id)
-- 2. User rows must already exist in public.users before the reporting links can
--    be attached by email
-- 3. This script safely skips people who have not signed up yet
-- ============================================================================

begin;

insert into public.hierarchy_levels (level_number, title, description)
values
  (1, 'Executive Director', 'Top-level strategic leadership'),
  (2, 'Director', 'Senior strategic leadership'),
  (3, 'Manager', 'Middle management - coordinates all departments'),
  (4, 'Department Head', 'Leads and manages individual department'),
  (5, 'Team Leader', 'Leads teams within a department'),
  (6, 'Employee', 'Individual contributor')
on conflict (level_number) do update
set title = excluded.title,
    description = excluded.description;

insert into public.roles (name, description)
values
  ('admin', 'System administrator'),
  ('director', 'Executive director overseeing organization'),
  ('manager', 'Central manager coordinating departments'),
  ('department_head', 'Head of department'),
  ('team_leader', 'Leader of team within department'),
  ('employee', 'Individual contributor')
on conflict (name) do update
set description = excluded.description;

insert into public.positions (name, description, level, min_reports, max_reports, is_active)
values
  ('Director', 'Executive director position', 2, 1, 5, true),
  ('Manager', 'Central manager coordinating all departments', 3, 6, 6, true),
  ('Department Head', 'Head of individual department', 4, 1, 10, true),
  ('Team Leader', 'Leader of a team', 5, 1, 8, true),
  ('Employee', 'Individual contributor', 6, 0, 0, true)
on conflict (name) do update
set description = excluded.description,
    level = excluded.level,
    min_reports = excluded.min_reports,
    max_reports = excluded.max_reports,
    is_active = excluded.is_active;

insert into public.departments (name, code, description, level, is_active)
values
  ('Finance Department', 'DEPT_FIN', 'Financial management and accounting', 1, true),
  ('Human Resources Department', 'DEPT_HR', 'Human resources and personnel', 1, true),
  ('Operations Department', 'DEPT_OPS', 'Business operations and logistics', 1, true),
  ('Sales Department', 'DEPT_SALES', 'Sales and business development', 1, true),
  ('Marketing Department', 'DEPT_MKT', 'Marketing and communications', 1, true),
  ('Technology Department', 'DEPT_TECH', 'Information technology and systems', 1, true)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    level = excluded.level,
    is_active = excluded.is_active;

insert into public.teams (team_code, name, department_id, description, is_active)
select
  replace(d.code, 'DEPT_', 'TEAM_'),
  replace(d.name, 'Department', 'Team'),
  d.id,
  'Primary operational team for ' || d.name,
  true
from public.departments d
where d.code in ('DEPT_FIN', 'DEPT_HR', 'DEPT_OPS', 'DEPT_SALES', 'DEPT_MKT', 'DEPT_TECH')
on conflict (team_code) do update
set name = excluded.name,
    department_id = excluded.department_id,
    description = excluded.description,
    is_active = excluded.is_active;

with people(email, role_name, position_name, department_code, manager_email) as (
  values
    ('bataar.director1@company.com', 'director', 'director', null, null),
    ('temujin.director2@company.com', 'director', 'director', null, 'bataar.director1@company.com'),
    ('khenbish.manager@company.com', 'manager', 'manager', null, 'bataar.director1@company.com'),
    ('enkh.fin@company.com', 'department_head', 'department_head', 'DEPT_FIN', 'khenbish.manager@company.com'),
    ('enkh.hr@company.com', 'department_head', 'department_head', 'DEPT_HR', 'khenbish.manager@company.com'),
    ('enkh.ops@company.com', 'department_head', 'department_head', 'DEPT_OPS', 'khenbish.manager@company.com'),
    ('enkh.sales@company.com', 'department_head', 'department_head', 'DEPT_SALES', 'khenbish.manager@company.com'),
    ('enkh.mkt@company.com', 'department_head', 'department_head', 'DEPT_MKT', 'khenbish.manager@company.com'),
    ('enkh.tech@company.com', 'department_head', 'department_head', 'DEPT_TECH', 'khenbish.manager@company.com'),
    ('oyu.leader1@company.com', 'team_leader', 'team_leader', 'DEPT_FIN', 'enkh.fin@company.com'),
    ('sarnai.leader2@company.com', 'team_leader', 'team_leader', 'DEPT_HR', 'enkh.hr@company.com'),
    ('tuvshin.leader3@company.com', 'team_leader', 'team_leader', 'DEPT_OPS', 'enkh.ops@company.com'),
    ('nara.leader4@company.com', 'team_leader', 'team_leader', 'DEPT_SALES', 'enkh.sales@company.com'),
    ('bold.leader5@company.com', 'team_leader', 'team_leader', 'DEPT_MKT', 'enkh.mkt@company.com'),
    ('ganzorig.leader6@company.com', 'team_leader', 'team_leader', 'DEPT_TECH', 'enkh.tech@company.com')
)
update public.users u
set role = p.role_name,
    role_id = r.id,
    position = p.position_name,
    status = 'active',
    is_active = true,
    department_id = d.id,
    manager_id = manager_user.id
from people p
left join public.roles r on r.name = p.role_name
left join public.departments d on d.code = p.department_code
left join public.users manager_user on manager_user.email = p.manager_email
where u.email = p.email;

update public.departments d
set manager_id = u.id
from public.users u
where d.code in ('DEPT_FIN', 'DEPT_HR', 'DEPT_OPS', 'DEPT_SALES', 'DEPT_MKT', 'DEPT_TECH')
  and u.department_id = d.id
  and u.position = 'department_head';

insert into public.management_assignments (user_id, department_id, assignment_type, assignment_date, is_primary)
select
  u.id,
  u.department_id,
  u.position,
  current_date,
  true
from public.users u
where u.position in ('department_head', 'team_leader')
  and u.department_id is not null
on conflict (user_id, department_id, assignment_type) do nothing;

insert into public.reporting_chains (user_id, direct_manager_id, hierarchy_level_id, effective_date, is_current)
select
  u.id,
  u.manager_id,
  hl.id,
  current_date,
  true
from public.users u
join public.hierarchy_levels hl
  on (u.position = 'director' and hl.level_number = 2)
  or (u.position = 'manager' and hl.level_number = 3)
  or (u.position = 'department_head' and hl.level_number = 4)
  or (u.position = 'team_leader' and hl.level_number = 5)
  or (u.position = 'employee' and hl.level_number = 6)
where u.manager_id is not null
on conflict (user_id, direct_manager_id, hierarchy_level_id, effective_date) do nothing;

insert into public.organizational_structure (user_id, department_id, position_level, reporting_to_user_id, effective_date, is_active)
select
  u.id,
  u.department_id,
  hl.level_number,
  u.manager_id,
  current_date,
  true
from public.users u
join public.hierarchy_levels hl
  on (u.position = 'director' and hl.level_number = 2)
  or (u.position = 'manager' and hl.level_number = 3)
  or (u.position = 'department_head' and hl.level_number = 4)
  or (u.position = 'team_leader' and hl.level_number = 5)
  or (u.position = 'employee' and hl.level_number = 6)
where coalesce(u.status, 'active') = 'active'
on conflict (user_id, effective_date) do nothing;

commit;
