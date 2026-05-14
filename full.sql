-- ============================================================
-- FULL DATABASE — Organization Management System
-- Supabase-ready | Run top to bottom in SQL Editor
-- ============================================================

-- ============================================================
-- PART 1: CLEAN SLATE
-- ============================================================
DROP TABLE IF EXISTS public.audit_logs              CASCADE;
DROP TABLE IF EXISTS public.notifications           CASCADE;
DROP TABLE IF EXISTS public.task_notifications      CASCADE;
DROP TABLE IF EXISTS public.task_workflow           CASCADE;
DROP TABLE IF EXISTS public.task_comments           CASCADE;
DROP TABLE IF EXISTS public.task_approvals          CASCADE;
DROP TABLE IF EXISTS public.task_document_rows      CASCADE;
DROP TABLE IF EXISTS public.tasks                   CASCADE;
DROP TABLE IF EXISTS public.fulfillment_logs        CASCADE;
DROP TABLE IF EXISTS public.fulfillment_history     CASCADE;
DROP TABLE IF EXISTS public.fulfillment_comments    CASCADE;
DROP TABLE IF EXISTS public.fulfillment_rows        CASCADE;
DROP TABLE IF EXISTS public.fulfillments            CASCADE;
DROP TABLE IF EXISTS public.meeting_recordings      CASCADE;
DROP TABLE IF EXISTS public.meeting_attendees       CASCADE;
DROP TABLE IF EXISTS public.meetings                CASCADE;
DROP TABLE IF EXISTS public.meeting_types           CASCADE;
DROP TABLE IF EXISTS public.assignment_updates      CASCADE;
DROP TABLE IF EXISTS public.work_assignments        CASCADE;
DROP TABLE IF EXISTS public.attendance_records      CASCADE;
DROP TABLE IF EXISTS public.enrollments             CASCADE;
DROP TABLE IF EXISTS public.sessions                CASCADE;
DROP TABLE IF EXISTS public.assessment_results      CASCADE;
DROP TABLE IF EXISTS public.assessments             CASCADE;
DROP TABLE IF EXISTS public.learning_materials      CASCADE;
DROP TABLE IF EXISTS public.lessons                 CASCADE;
DROP TABLE IF EXISTS public.modules                 CASCADE;
DROP TABLE IF EXISTS public.courses                 CASCADE;
DROP TABLE IF EXISTS public.certifications          CASCADE;
DROP TABLE IF EXISTS public.training_programs       CASCADE;
DROP TABLE IF EXISTS public.user_permissions        CASCADE;
DROP TABLE IF EXISTS public.reporting_chains        CASCADE;
DROP TABLE IF EXISTS public.organizational_changes  CASCADE;
DROP TABLE IF EXISTS public.organizational_metrics  CASCADE;
DROP TABLE IF EXISTS public.organizational_structure CASCADE;
DROP TABLE IF EXISTS public.span_of_control         CASCADE;
DROP TABLE IF EXISTS public.management_assignments  CASCADE;
DROP TABLE IF EXISTS public.team_members            CASCADE;
DROP TABLE IF EXISTS public.teams                   CASCADE;
DROP TABLE IF EXISTS public.positions               CASCADE;
DROP TABLE IF EXISTS public.hierarchy_levels        CASCADE;
DROP TABLE IF EXISTS public.users                   CASCADE;
DROP TABLE IF EXISTS public.departments             CASCADE;
DROP TABLE IF EXISTS public.roles                   CASCADE;
DROP TABLE IF EXISTS public.recordings              CASCADE;

-- ============================================================
-- PART 2: SCHEMA
-- ============================================================

-- ------------------------------------------------------------
-- 1. ROLES
-- ------------------------------------------------------------
CREATE TABLE public.roles (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        character varying NOT NULL UNIQUE,
  description text,
  level       integer NOT NULL,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. DEPARTMENTS (manager_id added later)
-- ------------------------------------------------------------
CREATE TABLE public.departments (
  id                   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                 character varying NOT NULL UNIQUE,
  code                 character varying NOT NULL UNIQUE,
  description          text,
  parent_department_id integer REFERENCES public.departments(id),
  level                integer DEFAULT 1,
  is_active            boolean DEFAULT true,
  created_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 3. USERS
-- ------------------------------------------------------------
CREATE TABLE public.users (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          character varying NOT NULL,
  email         character varying NOT NULL UNIQUE,
  password_hash character varying,
  role_id       integer NOT NULL DEFAULT 1 REFERENCES public.roles(id),
  department_id integer REFERENCES public.departments(id),
  phone         character varying,
  position      character varying NOT NULL
                  CHECK (position IN ('director1','director2','manager','department_head','team_leader')),
  status        character varying NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive','suspended')),
  manager_id    integer REFERENCES public.users(id),
  viber_id      text,
  is_active     boolean DEFAULT true,
  created_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Now add manager_id FK to departments
ALTER TABLE public.departments
  ADD COLUMN manager_id integer REFERENCES public.users(id);

-- ------------------------------------------------------------
-- 4. HIERARCHY LEVELS
-- ------------------------------------------------------------
CREATE TABLE public.hierarchy_levels (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  level_number integer NOT NULL UNIQUE,
  title        character varying NOT NULL,
  description  text,
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 5. POSITIONS
-- ------------------------------------------------------------
CREATE TABLE public.positions (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name             character varying NOT NULL UNIQUE,
  description      text,
  level            integer NOT NULL,
  min_reports      integer DEFAULT 0,
  max_reports      integer,
  salary_range_min numeric,
  salary_range_max numeric,
  is_active        boolean DEFAULT true,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 6. TEAMS
-- ------------------------------------------------------------
CREATE TABLE public.teams (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_code    character varying NOT NULL UNIQUE,
  name         character varying NOT NULL,
  description  text,
  department_id integer REFERENCES public.departments(id),
  lead_user_id integer REFERENCES public.users(id),
  is_active    boolean NOT NULL DEFAULT true,
  status       character varying NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active','inactive','dissolved')),
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 7. TEAM MEMBERS
-- ------------------------------------------------------------
CREATE TABLE public.team_members (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id      bigint NOT NULL REFERENCES public.teams(id),
  user_id      integer NOT NULL REFERENCES public.users(id),
  team_role    character varying NOT NULL DEFAULT 'member',
  is_team_lead boolean NOT NULL DEFAULT false,
  joined_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  left_at      timestamp without time zone,
  is_active    boolean DEFAULT true,
  CONSTRAINT team_members_team_user_unique UNIQUE (team_id, user_id)
);

-- ------------------------------------------------------------
-- 8. MANAGEMENT ASSIGNMENTS
-- ------------------------------------------------------------
CREATE TABLE public.management_assignments (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         integer NOT NULL REFERENCES public.users(id),
  department_id   integer REFERENCES public.departments(id),
  team_id         bigint  REFERENCES public.teams(id),
  assignment_type character varying NOT NULL
                    CHECK (assignment_type IN ('department_head','team_leader','director','manager')),
  assignment_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date        date,
  is_primary      boolean DEFAULT true,
  created_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 9. REPORTING CHAINS
-- ------------------------------------------------------------
CREATE TABLE public.reporting_chains (
  id                 integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id            integer NOT NULL REFERENCES public.users(id),
  direct_manager_id  integer NOT NULL REFERENCES public.users(id),
  hierarchy_level_id integer NOT NULL REFERENCES public.hierarchy_levels(id),
  effective_date     date NOT NULL DEFAULT CURRENT_DATE,
  end_date           date,
  is_current         boolean DEFAULT true,
  created_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 10. ORGANIZATIONAL STRUCTURE
-- ------------------------------------------------------------
CREATE TABLE public.organizational_structure (
  id                   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id              integer NOT NULL REFERENCES public.users(id),
  department_id        integer NOT NULL REFERENCES public.departments(id),
  position_level       integer NOT NULL,
  reporting_to_user_id integer REFERENCES public.users(id),
  effective_date       date NOT NULL DEFAULT CURRENT_DATE,
  end_date             date,
  is_active            boolean DEFAULT true,
  created_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 11. ORGANIZATIONAL METRICS
-- ------------------------------------------------------------
CREATE TABLE public.organizational_metrics (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  department_id    integer REFERENCES public.departments(id),
  team_id          bigint  REFERENCES public.teams(id),
  total_headcount  integer NOT NULL DEFAULT 0,
  active_employees integer NOT NULL DEFAULT 0,
  vacant_positions integer NOT NULL DEFAULT 0,
  calculated_date  date NOT NULL DEFAULT CURRENT_DATE,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 12. ORGANIZATIONAL CHANGES
-- ------------------------------------------------------------
CREATE TABLE public.organizational_changes (
  id                     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  change_type            character varying NOT NULL
                           CHECK (change_type IN ('user_assigned','user_removed','position_created',
                                                  'department_restructured','reporting_changed')),
  user_id                integer REFERENCES public.users(id),
  affected_department_id integer REFERENCES public.departments(id),
  affected_team_id       bigint  REFERENCES public.teams(id),
  old_value              text,
  new_value              text,
  reason                 text,
  changed_by             integer NOT NULL REFERENCES public.users(id),
  change_date            timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 13. SPAN OF CONTROL
-- ------------------------------------------------------------
CREATE TABLE public.span_of_control (
  id                         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  position_id                integer NOT NULL REFERENCES public.positions(id),
  min_direct_reports         integer DEFAULT 0,
  max_direct_reports         integer,
  recommended_direct_reports integer,
  created_at                 timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at                 timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 14. USER PERMISSIONS
-- ------------------------------------------------------------
CREATE TABLE public.user_permissions (
  id                 integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id            integer NOT NULL REFERENCES public.users(id),
  permission_name    character varying NOT NULL,
  resource_type      character varying NOT NULL,
  can_create         boolean DEFAULT false,
  can_read           boolean DEFAULT true,
  can_update         boolean DEFAULT false,
  can_delete         boolean DEFAULT false,
  granted_by_user_id integer REFERENCES public.users(id),
  created_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at         timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 15. MEETING TYPES
-- ------------------------------------------------------------
CREATE TABLE public.meeting_types (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name              character varying NOT NULL UNIQUE,
  description       text,
  requires_approval boolean DEFAULT false,
  created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 16. MEETINGS
-- ------------------------------------------------------------
CREATE TABLE public.meetings (
  id                  integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_code        character varying NOT NULL UNIQUE,
  meeting_type_id     integer REFERENCES public.meeting_types(id),
  title               character varying NOT NULL,
  description         text,
  agenda              text,
  organizer_id        integer REFERENCES public.users(id),
  meeting_date        timestamp without time zone NOT NULL,
  location            character varying,
  status              character varying NOT NULL DEFAULT 'scheduled'
                        CHECK (status IN ('scheduled','completed','cancelled')),
  -- Manager reaction for official acknowledgement
  manager_reaction    character varying CHECK (manager_reaction IN ('approved','rejected','noted')),
  manager_reaction_at timestamp without time zone,
  manager_comment     text,
  created_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 17. MEETING ATTENDEES
-- ------------------------------------------------------------
CREATE TABLE public.meeting_attendees (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id integer NOT NULL REFERENCES public.meetings(id),
  user_id    integer NOT NULL REFERENCES public.users(id),
  attended   boolean DEFAULT false,
  notes      text,
  UNIQUE (meeting_id, user_id)
);

-- ------------------------------------------------------------
-- 18. MEETING RECORDINGS (video/audio — required by policy)
-- ------------------------------------------------------------
CREATE TABLE public.meeting_recordings (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id       integer NOT NULL REFERENCES public.meetings(id),
  user_id          integer REFERENCES public.users(id),
  file_path        text NOT NULL,
  public_url       text,
  file_size        integer,
  duration_seconds integer,
  recording_type   character varying NOT NULL DEFAULT 'video'
                     CHECK (recording_type IN ('video','audio')),
  transcription    text,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 19. RECORDINGS (standalone — e.g. voice notes)
-- ------------------------------------------------------------
CREATE TABLE public.recordings (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recording_id character varying NOT NULL UNIQUE,
  name         character varying NOT NULL,
  duration     character varying NOT NULL,
  storage_path character varying NOT NULL,
  public_url   character varying,
  transcript   text,
  category     character varying DEFAULT 'Ерөнхий',
  user_id      character varying,
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 20. TASKS
-- Task status flow:
-- new → in_progress → review → corrected → re_verified → completed → fulfillment
-- ------------------------------------------------------------
CREATE TABLE public.tasks (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_code         character varying NOT NULL UNIQUE,
  title             character varying NOT NULL,
  description       text,
  priority          character varying NOT NULL DEFAULT 'medium'
                      CHECK (priority IN ('low','medium','high','critical')),
  status            character varying NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','in_progress','review','corrected','re_verified','completed','cancelled')),
  due_date          date,
  -- Who created and assigned
  created_by        integer REFERENCES public.users(id),
  assigned_to       integer REFERENCES public.users(id),
  -- Hierarchy tracking
  department_id     integer REFERENCES public.departments(id),
  team_id           bigint  REFERENCES public.teams(id),
  -- Written response required (policy)
  requires_response boolean NOT NULL DEFAULT true,
  response_text     text,
  responded_at      timestamp without time zone,
  -- PDF export tracking
  pdf_exported      boolean DEFAULT false,
  pdf_exported_at   timestamp without time zone,
  -- Performance tracking
  completed_at      timestamp without time zone,
  is_overdue        boolean DEFAULT false,
  created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update is_overdue on every insert/update
CREATE OR REPLACE FUNCTION update_task_overdue()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_overdue := (
    NEW.due_date IS NOT NULL AND
    NEW.due_date < CURRENT_DATE AND
    NEW.status NOT IN ('completed', 'cancelled')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_overdue_trigger
BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_task_overdue();

-- ------------------------------------------------------------
-- 21. TASK COMMENTS (written response required per policy)
-- ------------------------------------------------------------
CREATE TABLE public.task_comments (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id    integer NOT NULL REFERENCES public.tasks(id),
  user_id    integer NOT NULL REFERENCES public.users(id),
  comment    text NOT NULL,
  is_official boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 22. TASK WORKFLOW (full audit of every status change)
-- ------------------------------------------------------------
CREATE TABLE public.task_workflow (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id           integer NOT NULL REFERENCES public.tasks(id),
  from_status       character varying NOT NULL,
  to_status         character varying NOT NULL,
  action_by_user_id integer NOT NULL REFERENCES public.users(id),
  action_date       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  comments          text,
  created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 23. TASK APPROVALS
-- ------------------------------------------------------------
CREATE TABLE public.task_approvals (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id        integer NOT NULL REFERENCES public.tasks(id),
  approver_id    integer NOT NULL REFERENCES public.users(id),
  approval_level integer NOT NULL DEFAULT 1,
  status         character varying NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected')),
  approval_date  timestamp without time zone,
  comments       text,
  created_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 24. TASK DOCUMENT ROWS
-- ------------------------------------------------------------
CREATE TABLE public.task_document_rows (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_ref_id integer NOT NULL,
  row_no      integer NOT NULL,
  task_text   text,
  due_text    character varying,
  owner_text  text,
  created_by  integer REFERENCES public.users(id),
  updated_by  integer REFERENCES public.users(id),
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 25. TASK NOTIFICATIONS
-- ------------------------------------------------------------
CREATE TABLE public.task_notifications (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id           integer NOT NULL REFERENCES public.tasks(id),
  user_id           integer NOT NULL REFERENCES public.users(id),
  notification_type character varying NOT NULL
                      CHECK (notification_type IN ('assigned','review_required','approved',
                                                   'rejected','due_soon','overdue','corrected','re_verified')),
  message           text NOT NULL,
  is_read           boolean DEFAULT false,
  sent_date         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  read_date         timestamp without time zone,
  created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 26. WORK ASSIGNMENTS (direct person-to-person assignments)
-- ------------------------------------------------------------
CREATE TABLE public.work_assignments (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assignment_code     character varying NOT NULL UNIQUE,
  title               character varying NOT NULL,
  description         text,
  assigned_by         integer NOT NULL REFERENCES public.users(id),
  assigned_to         integer NOT NULL REFERENCES public.users(id),
  team_id             bigint  REFERENCES public.teams(id),
  priority            character varying NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low','medium','high','critical')),
  status              character varying NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','in_progress','blocked','completed','overdue','cancelled')),
  visibility_scope    character varying NOT NULL DEFAULT 'personal'
                        CHECK (visibility_scope IN ('personal','team')),
  start_at            timestamp without time zone,
  due_at              timestamp without time zone NOT NULL,
  completed_at        timestamp without time zone,
  delivery_to_user_id integer REFERENCES public.users(id),
  delivery_location   character varying,
  delivery_channel    character varying,
  expected_output     text,
  -- Written response required
  response_text       text,
  responded_at        timestamp without time zone,
  -- PDF export
  pdf_exported        boolean DEFAULT false,
  latest_progress     integer NOT NULL DEFAULT 0
                        CHECK (latest_progress >= 0 AND latest_progress <= 100),
  created_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 27. ASSIGNMENT UPDATES
-- ------------------------------------------------------------
CREATE TABLE public.assignment_updates (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assignment_id    bigint NOT NULL REFERENCES public.work_assignments(id),
  updated_by       integer NOT NULL REFERENCES public.users(id),
  progress_percent integer NOT NULL DEFAULT 0
                     CHECK (progress_percent >= 0 AND progress_percent <= 100),
  status           character varying
                     CHECK (status IN ('pending','in_progress','blocked','completed','overdue','cancelled')),
  note             text NOT NULL,
  attachment_url   text,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 28. FULFILLMENTS (confirmed/completed tasks — official record)
-- ------------------------------------------------------------
CREATE TABLE public.fulfillments (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_code character varying NOT NULL UNIQUE,
  title            character varying NOT NULL,
  description      text,
  -- Links back to source task
  task_id          integer REFERENCES public.tasks(id),
  status           character varying NOT NULL DEFAULT 'sent'
                     CHECK (status IN ('sent','approved','rejected','completed')),
  sent_to          integer REFERENCES public.users(id),
  sent_by          integer REFERENCES public.users(id),
  sent_date        date,
  completed_date   date,
  -- PDF export required by policy
  pdf_url          text,
  pdf_exported_at  timestamp without time zone,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 29. FULFILLMENT ROWS (line items)
-- ------------------------------------------------------------
CREATE TABLE public.fulfillment_rows (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_id bigint NOT NULL REFERENCES public.fulfillments(id),
  task           text,
  unit           text,
  result         text,
  percent        text,
  row_index      integer NOT NULL,
  created_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 30. FULFILLMENT COMMENTS
-- ------------------------------------------------------------
CREATE TABLE public.fulfillment_comments (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_id integer NOT NULL REFERENCES public.fulfillments(id),
  author_id      integer NOT NULL REFERENCES public.users(id),
  text           text NOT NULL,
  parent_id      integer REFERENCES public.fulfillment_comments(id),
  created_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 31. FULFILLMENT HISTORY (snapshots for audit)
-- ------------------------------------------------------------
CREATE TABLE public.fulfillment_history (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_id integer NOT NULL REFERENCES public.fulfillments(id),
  saved_by       integer REFERENCES public.users(id),
  saved_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  snapshot       jsonb NOT NULL
);

-- ------------------------------------------------------------
-- 32. FULFILLMENT LOGS
-- ------------------------------------------------------------
CREATE TABLE public.fulfillment_logs (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_id integer REFERENCES public.fulfillments(id),
  action         text NOT NULL,
  created_by     integer REFERENCES public.users(id),
  created_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 33. TRAINING PROGRAMS
-- ------------------------------------------------------------
CREATE TABLE public.training_programs (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  program_code  character varying NOT NULL UNIQUE,
  title         character varying NOT NULL,
  description   text,
  level         character varying NOT NULL
                  CHECK (level IN ('beginner','intermediate','advanced')),
  duration_days integer NOT NULL,
  created_by    integer REFERENCES public.users(id),
  status        character varying NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','published','archived')),
  created_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 34. COURSES
-- ------------------------------------------------------------
CREATE TABLE public.courses (
  id                     integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  program_id             integer REFERENCES public.training_programs(id),
  course_code            character varying NOT NULL UNIQUE,
  title                  character varying NOT NULL,
  description            text,
  duration_hours         integer NOT NULL,
  prerequisite_course_id integer REFERENCES public.courses(id),
  status                 character varying NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft','published','archived')),
  created_at             timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at             timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 35. MODULES
-- ------------------------------------------------------------
CREATE TABLE public.modules (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id        integer NOT NULL REFERENCES public.courses(id),
  title            character varying NOT NULL,
  description      text,
  order_index      integer NOT NULL,
  duration_minutes integer NOT NULL,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 36. LESSONS
-- ------------------------------------------------------------
CREATE TABLE public.lessons (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  module_id        integer NOT NULL REFERENCES public.modules(id),
  title            character varying NOT NULL,
  content_type     character varying NOT NULL
                     CHECK (content_type IN ('video','document','quiz','live','assignment')),
  content_url      text,
  duration_minutes integer,
  order_index      integer NOT NULL,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 37. LEARNING MATERIALS
-- ------------------------------------------------------------
CREATE TABLE public.learning_materials (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id     integer NOT NULL REFERENCES public.courses(id),
  title         character varying NOT NULL,
  material_type character varying NOT NULL
                  CHECK (material_type IN ('document','video','link','slides','ebook')),
  url           text NOT NULL,
  description   text,
  uploaded_by   integer REFERENCES public.users(id),
  uploaded_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 38. ASSESSMENTS
-- ------------------------------------------------------------
CREATE TABLE public.assessments (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id       integer NOT NULL REFERENCES public.courses(id),
  title           character varying NOT NULL,
  assessment_type character varying NOT NULL
                    CHECK (assessment_type IN ('quiz','project','exam','assignment')),
  max_score       integer NOT NULL,
  passing_score   integer NOT NULL,
  due_date        date,
  created_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 39. ASSESSMENT RESULTS
-- ------------------------------------------------------------
CREATE TABLE public.assessment_results (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assessment_id integer NOT NULL REFERENCES public.assessments(id),
  user_id       integer NOT NULL REFERENCES public.users(id),
  score         integer NOT NULL,
  status        character varying NOT NULL
                  CHECK (status IN ('pending','graded','failed','passed')),
  submitted_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  graded_by     integer REFERENCES public.users(id),
  feedback      text
);

-- ------------------------------------------------------------
-- 40. SESSIONS
-- ------------------------------------------------------------
CREATE TABLE public.sessions (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id    integer NOT NULL REFERENCES public.courses(id),
  session_code character varying NOT NULL UNIQUE,
  title        character varying NOT NULL,
  description  text,
  location     character varying,
  organizer_id integer REFERENCES public.users(id),
  start_date   timestamp without time zone NOT NULL,
  end_date     timestamp without time zone NOT NULL,
  capacity     integer,
  status       character varying NOT NULL DEFAULT 'scheduled'
                 CHECK (status IN ('scheduled','ongoing','completed','cancelled')),
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 41. ENROLLMENTS
-- ------------------------------------------------------------
CREATE TABLE public.enrollments (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         integer NOT NULL REFERENCES public.users(id),
  session_id      integer NOT NULL REFERENCES public.sessions(id),
  enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status          character varying NOT NULL DEFAULT 'registered'
                    CHECK (status IN ('registered','attended','dropped','completed')),
  progress        integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  final_grade     character varying,
  completed_at    timestamp without time zone
);

-- ------------------------------------------------------------
-- 42. ATTENDANCE RECORDS
-- ------------------------------------------------------------
CREATE TABLE public.attendance_records (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  enrollment_id integer NOT NULL REFERENCES public.enrollments(id),
  meeting_date  date NOT NULL,
  status        character varying NOT NULL
                  CHECK (status IN ('present','absent','late','excused')),
  remarks       text,
  created_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 43. CERTIFICATIONS
-- ------------------------------------------------------------
CREATE TABLE public.certifications (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          integer NOT NULL REFERENCES public.users(id),
  program_id       integer NOT NULL REFERENCES public.training_programs(id),
  certificate_code character varying NOT NULL UNIQUE,
  issued_date      date NOT NULL,
  expires_at       date,
  status           character varying NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active','expired','revoked')),
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 44. NOTIFICATIONS (system-wide, triggered on every action)
-- ------------------------------------------------------------
CREATE TABLE public.notifications (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES public.users(id),
  title      character varying NOT NULL,
  message    text NOT NULL,
  type       character varying NOT NULL
               CHECK (type IN ('info','warning','alert','success','comment','meeting','task','fulfillment')),
  link       character varying,
  is_read    boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 45. AUDIT LOGS (full trail of every action)
-- ------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     integer REFERENCES public.users(id),
  action      character varying NOT NULL,
  object_type character varying,
  object_id   integer,
  details     jsonb,
  ip_address  character varying,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PART 3: SEED DATA
-- ============================================================

-- ------------------------------------------------------------
-- ROLES (5 levels, no employee)
-- ------------------------------------------------------------
INSERT INTO public.roles (name, description, level) VALUES
  ('director1',       'Top level director — full system authority',                         1),
  ('director2',       'Second level director — reports to Director 1',                      2),
  ('manager',         'Operations manager — distributes tasks to department heads',         3),
  ('department_head', 'Department head — manages team leaders in their department',         4),
  ('team_leader',     'Team leader — executes tasks and reports back to department head',   5);

-- ------------------------------------------------------------
-- HIERARCHY LEVELS
-- ------------------------------------------------------------
INSERT INTO public.hierarchy_levels (level_number, title, description) VALUES
  (1, 'Director 1',       'Top executive level'),
  (2, 'Director 2',       'Senior director level'),
  (3, 'Manager',          'Operations management level'),
  (4, 'Department Head',  'Department leadership level'),
  (5, 'Team Leader',      'Team execution level');

-- ------------------------------------------------------------
-- DEPARTMENTS (no manager_id yet)
-- ------------------------------------------------------------
INSERT INTO public.departments (name, code, description, level, is_active) VALUES
  ('Удирдлагын алба',    'DEPT_MGMT', 'Executive management office',  1, true),
  ('Санхүүгийн алба',   'DEPT_FIN',  'Financial management',          1, true),
  ('Хүний нөөцийн алба','DEPT_HR',   'Human resources',               1, true),
  ('Маркетингийн алба', 'DEPT_MKT',  'Marketing and communications',  1, true),
  ('Технологийн алба',  'DEPT_TECH', 'Information technology',        1, true),
  ('Үйл ажиллагааны алба','DEPT_OPS','Operations',                    1, true);

-- ------------------------------------------------------------
-- USERS (no department_id first)
-- ------------------------------------------------------------
INSERT INTO public.users (name, email, role_id, position, status, is_active) VALUES
  -- Director 1
  ('Директор 1 Энх',        'director1@company.mn',       1, 'director1',       'active', true),
  -- Director 2
  ('Директор 2 Номин',      'director2@company.mn',       2, 'director2',       'active', true),
  -- Manager
  ('Менежер Бат',           'manager@company.mn',         3, 'manager',         'active', true),
  -- Department heads (1 per dept)
  ('Дарга Алтан',           'head.fin@company.mn',        4, 'department_head', 'active', true),
  ('Дарга Цэцэг',           'head.hr@company.mn',         4, 'department_head', 'active', true),
  ('Дарга Болд',            'head.mkt@company.mn',        4, 'department_head', 'active', true),
  ('Дарга Сарнай',          'head.tech@company.mn',       4, 'department_head', 'active', true),
  ('Дарга Мөнх',            'head.ops@company.mn',        4, 'department_head', 'active', true),
  ('Дарга Оюун',            'head.mgmt@company.mn',       4, 'department_head', 'active', true),
  -- Team leaders (1 per dept)
  ('Ахлагч Ганбат',         'leader.fin@company.mn',      5, 'team_leader',     'active', true),
  ('Ахлагч Нарантуяа',      'leader.hr@company.mn',       5, 'team_leader',     'active', true),
  ('Ахлагч Төмөр',          'leader.mkt@company.mn',      5, 'team_leader',     'active', true),
  ('Ахлагч Энхжин',         'leader.tech@company.mn',     5, 'team_leader',     'active', true),
  ('Ахлагч Дэлгэр',         'leader.ops@company.mn',      5, 'team_leader',     'active', true),
  ('Ахлагч Зулаа',          'leader.mgmt@company.mn',     5, 'team_leader',     'active', true);

-- ------------------------------------------------------------
-- LINK users → departments
-- ------------------------------------------------------------
UPDATE public.users SET department_id = (SELECT id FROM public.departments WHERE code='DEPT_MGMT') WHERE email IN ('director1@company.mn','director2@company.mn','manager@company.mn','head.mgmt@company.mn','leader.mgmt@company.mn');
UPDATE public.users SET department_id = (SELECT id FROM public.departments WHERE code='DEPT_FIN')  WHERE email IN ('head.fin@company.mn','leader.fin@company.mn');
UPDATE public.users SET department_id = (SELECT id FROM public.departments WHERE code='DEPT_HR')   WHERE email IN ('head.hr@company.mn','leader.hr@company.mn');
UPDATE public.users SET department_id = (SELECT id FROM public.departments WHERE code='DEPT_MKT')  WHERE email IN ('head.mkt@company.mn','leader.mkt@company.mn');
UPDATE public.users SET department_id = (SELECT id FROM public.departments WHERE code='DEPT_TECH') WHERE email IN ('head.tech@company.mn','leader.tech@company.mn');
UPDATE public.users SET department_id = (SELECT id FROM public.departments WHERE code='DEPT_OPS')  WHERE email IN ('head.ops@company.mn','leader.ops@company.mn');

-- ------------------------------------------------------------
-- WIRE manager_id (reporting chain)
-- ------------------------------------------------------------
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='director1@company.mn') WHERE email = 'director2@company.mn';
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='director2@company.mn') WHERE email = 'manager@company.mn';
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='manager@company.mn')   WHERE email IN ('head.fin@company.mn','head.hr@company.mn','head.mkt@company.mn','head.tech@company.mn','head.ops@company.mn','head.mgmt@company.mn');
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='head.fin@company.mn')  WHERE email = 'leader.fin@company.mn';
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='head.hr@company.mn')   WHERE email = 'leader.hr@company.mn';
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='head.mkt@company.mn')  WHERE email = 'leader.mkt@company.mn';
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='head.tech@company.mn') WHERE email = 'leader.tech@company.mn';
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='head.ops@company.mn')  WHERE email = 'leader.ops@company.mn';
UPDATE public.users SET manager_id = (SELECT id FROM public.users WHERE email='head.mgmt@company.mn') WHERE email = 'leader.mgmt@company.mn';

-- ------------------------------------------------------------
-- LINK departments → managers
-- ------------------------------------------------------------
UPDATE public.departments SET manager_id = (SELECT id FROM public.users WHERE email='head.mgmt@company.mn') WHERE code='DEPT_MGMT';
UPDATE public.departments SET manager_id = (SELECT id FROM public.users WHERE email='head.fin@company.mn')  WHERE code='DEPT_FIN';
UPDATE public.departments SET manager_id = (SELECT id FROM public.users WHERE email='head.hr@company.mn')   WHERE code='DEPT_HR';
UPDATE public.departments SET manager_id = (SELECT id FROM public.users WHERE email='head.mkt@company.mn')  WHERE code='DEPT_MKT';
UPDATE public.departments SET manager_id = (SELECT id FROM public.users WHERE email='head.tech@company.mn') WHERE code='DEPT_TECH';
UPDATE public.departments SET manager_id = (SELECT id FROM public.users WHERE email='head.ops@company.mn')  WHERE code='DEPT_OPS';

-- ------------------------------------------------------------
-- TEAMS
-- ------------------------------------------------------------
INSERT INTO public.teams (team_code, name, department_id, lead_user_id, description, is_active)
VALUES
  ('TEAM_MGMT', 'Удирдлагын баг',      (SELECT id FROM public.departments WHERE code='DEPT_MGMT'), (SELECT id FROM public.users WHERE email='leader.mgmt@company.mn'), 'Executive management team',    true),
  ('TEAM_FIN',  'Санхүүгийн баг',     (SELECT id FROM public.departments WHERE code='DEPT_FIN'),  (SELECT id FROM public.users WHERE email='leader.fin@company.mn'),  'Financial operations team',    true),
  ('TEAM_HR',   'Хүний нөөцийн баг',  (SELECT id FROM public.departments WHERE code='DEPT_HR'),   (SELECT id FROM public.users WHERE email='leader.hr@company.mn'),   'HR management team',           true),
  ('TEAM_MKT',  'Маркетингийн баг',   (SELECT id FROM public.departments WHERE code='DEPT_MKT'),  (SELECT id FROM public.users WHERE email='leader.mkt@company.mn'),  'Marketing team',               true),
  ('TEAM_TECH', 'Технологийн баг',    (SELECT id FROM public.departments WHERE code='DEPT_TECH'), (SELECT id FROM public.users WHERE email='leader.tech@company.mn'), 'IT development team',          true),
  ('TEAM_OPS',  'Үйл ажиллагааны баг',(SELECT id FROM public.departments WHERE code='DEPT_OPS'),  (SELECT id FROM public.users WHERE email='leader.ops@company.mn'),  'Operations team',              true);

-- ------------------------------------------------------------
-- TEAM MEMBERS
-- ------------------------------------------------------------
INSERT INTO public.team_members (team_id, user_id, team_role, is_team_lead, joined_at)
SELECT
  t.id,
  u.id,
  CASE WHEN u.id = t.lead_user_id THEN 'Team Lead' ELSE 'Member' END,
  u.id = t.lead_user_id,
  NOW()
FROM public.teams t
JOIN public.users u ON u.department_id = t.department_id
WHERE u.is_active = true;

-- ------------------------------------------------------------
-- MEETING TYPES
-- ------------------------------------------------------------
INSERT INTO public.meeting_types (name, description, requires_approval) VALUES
  ('Ээлжит хурал',         'Regular scheduled meeting',                  false),
  ('Яаралтай хурал',       'Emergency meeting',                          true),
  ('Тайлангийн хурал',     'Reporting and review meeting',               false),
  ('Төлөвлөгөөний хурал',  'Planning meeting',                           false),
  ('Үнэлгээний хурал',     'Performance evaluation meeting',             true);

-- ------------------------------------------------------------
-- SAMPLE TASKS (demonstrating the full workflow)
-- ------------------------------------------------------------
INSERT INTO public.tasks (task_code, title, description, priority, status, due_date, created_by, assigned_to, department_id, requires_response)
VALUES
  ('TASK-001', 'Сарын тайлан бэлтгэх',    'Санхүүгийн сарын тайланг бэлтгэж менежерт өгөх',  'high',     'new',         CURRENT_DATE + 7,  (SELECT id FROM public.users WHERE email='manager@company.mn'),   (SELECT id FROM public.users WHERE email='head.fin@company.mn'),  (SELECT id FROM public.departments WHERE code='DEPT_FIN'),  true),
  ('TASK-002', 'Ажилтны гүйцэтгэл шалгах','Хүний нөөцийн ажилтнуудын гүйцэтгэлийг үнэлэх',  'medium',   'in_progress', CURRENT_DATE + 14, (SELECT id FROM public.users WHERE email='manager@company.mn'),   (SELECT id FROM public.users WHERE email='head.hr@company.mn'),   (SELECT id FROM public.departments WHERE code='DEPT_HR'),   true),
  ('TASK-003', 'Маркетингийн төлөвлөгөө', 'Q2 маркетингийн төлөвлөгөө боловсруулах',          'high',     'review',      CURRENT_DATE + 3,  (SELECT id FROM public.users WHERE email='manager@company.mn'),   (SELECT id FROM public.users WHERE email='head.mkt@company.mn'),  (SELECT id FROM public.departments WHERE code='DEPT_MKT'),  true),
  ('TASK-004', 'Системийн шинэчлэл',       'Дотоод системийг шинэчлэх, туршилт хийх',          'critical', 'corrected',   CURRENT_DATE + 1,  (SELECT id FROM public.users WHERE email='head.tech@company.mn'), (SELECT id FROM public.users WHERE email='leader.tech@company.mn'),(SELECT id FROM public.departments WHERE code='DEPT_TECH'), true),
  ('TASK-005', 'Үйл ажиллагааны тайлан',  'Долоо хоногийн үйл ажиллагааны тайлан гаргах',    'medium',   'completed',   CURRENT_DATE - 2,  (SELECT id FROM public.users WHERE email='manager@company.mn'),   (SELECT id FROM public.users WHERE email='head.ops@company.mn'),  (SELECT id FROM public.departments WHERE code='DEPT_OPS'),  true);

-- ------------------------------------------------------------
-- SAMPLE TASK WORKFLOW LOG
-- ------------------------------------------------------------
INSERT INTO public.task_workflow (task_id, from_status, to_status, action_by_user_id, comments)
VALUES
  ((SELECT id FROM public.tasks WHERE task_code='TASK-002'), 'new',         'in_progress', (SELECT id FROM public.users WHERE email='head.hr@company.mn'),   'Ажил эхэллээ'),
  ((SELECT id FROM public.tasks WHERE task_code='TASK-003'), 'new',         'in_progress', (SELECT id FROM public.users WHERE email='head.mkt@company.mn'),  'Эхэллээ'),
  ((SELECT id FROM public.tasks WHERE task_code='TASK-003'), 'in_progress', 'review',      (SELECT id FROM public.users WHERE email='head.mkt@company.mn'),  'Шалгуулахаар илгээлээ'),
  ((SELECT id FROM public.tasks WHERE task_code='TASK-004'), 'new',         'in_progress', (SELECT id FROM public.users WHERE email='leader.tech@company.mn'),'Эхэллээ'),
  ((SELECT id FROM public.tasks WHERE task_code='TASK-004'), 'in_progress', 'review',      (SELECT id FROM public.users WHERE email='leader.tech@company.mn'),'Шалгуулахаар илгээлээ'),
  ((SELECT id FROM public.tasks WHERE task_code='TASK-004'), 'review',      'corrected',   (SELECT id FROM public.users WHERE email='head.tech@company.mn'), 'Засвар хийгдлээ'),
  ((SELECT id FROM public.tasks WHERE task_code='TASK-005'), 'new',         'in_progress', (SELECT id FROM public.users WHERE email='head.ops@company.mn'),  'Эхэллээ'),
  ((SELECT id FROM public.tasks WHERE task_code='TASK-005'), 'in_progress', 'completed',   (SELECT id FROM public.users WHERE email='head.ops@company.mn'),  'Дууслаа');

-- ------------------------------------------------------------
-- SAMPLE FULFILLMENT (from completed task)
-- ------------------------------------------------------------
INSERT INTO public.fulfillments (fulfillment_code, title, description, task_id, status, sent_by, sent_to, sent_date)
VALUES (
  'FUL-001',
  'Үйл ажиллагааны тайлан — биелэлт',
  'Долоо хоногийн үйл ажиллагааны тайлан амжилттай дууслаа',
  (SELECT id FROM public.tasks WHERE task_code='TASK-005'),
  'sent',
  (SELECT id FROM public.users WHERE email='head.ops@company.mn'),
  (SELECT id FROM public.users WHERE email='manager@company.mn'),
  CURRENT_DATE
);

INSERT INTO public.fulfillment_rows (fulfillment_id, task, unit, result, percent, row_index)
VALUES
  ((SELECT id FROM public.fulfillments WHERE fulfillment_code='FUL-001'), 'Өдрийн тайлан',       'Тайлан', 'Дууссан', '100', 1),
  ((SELECT id FROM public.fulfillments WHERE fulfillment_code='FUL-001'), 'Багийн уулзалт',      'Хурал',  'Дууссан', '100', 2),
  ((SELECT id FROM public.fulfillments WHERE fulfillment_code='FUL-001'), 'Гүйцэтгэлийн үнэлгээ','Үнэлгээ','Дууссан', '100', 3);

-- ------------------------------------------------------------
-- SAMPLE MEETING
-- ------------------------------------------------------------
INSERT INTO public.meetings (meeting_code, meeting_type_id, title, description, organizer_id, meeting_date, location, status)
VALUES (
  'MTG-001',
  (SELECT id FROM public.meeting_types WHERE name='Тайлангийн хурал'),
  'Долоо хоногийн тайлангийн хурал',
  'Бүх хэлтсийн долоо хоногийн тайлан, биелэлтийг хэлэлцэх',
  (SELECT id FROM public.users WHERE email='manager@company.mn'),
  NOW() + INTERVAL '2 days',
  'Хурлын өрөө 1',
  'scheduled'
);

-- Add all dept heads as attendees
INSERT INTO public.meeting_attendees (meeting_id, user_id, attended)
SELECT
  (SELECT id FROM public.meetings WHERE meeting_code='MTG-001'),
  u.id,
  false
FROM public.users u
WHERE u.position IN ('department_head','manager','director2','director1');

-- ------------------------------------------------------------
-- SAMPLE NOTIFICATIONS
-- ------------------------------------------------------------
INSERT INTO public.notifications (user_id, title, message, type, link)
SELECT
  u.id,
  'Шинэ даалгавар хүлээн авлаа',
  'Танд шинэ даалгавар ирлээ. Нэвтэрч үзнэ үү.',
  'task',
  '/tasks'
FROM public.users u
WHERE u.position = 'department_head';

INSERT INTO public.notifications (user_id, title, message, type, link)
VALUES (
  (SELECT id FROM public.users WHERE email='manager@company.mn'),
  'Хурал товлогдлоо',
  'Долоо хоногийн тайлангийн хурал 2 хоногийн дараа болно.',
  'meeting',
  '/meetings'
);

-- ============================================================
-- PART 4: ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments   ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFY
-- ============================================================
SELECT 'roles'              AS "table", COUNT(*) AS "rows" FROM public.roles
UNION ALL SELECT 'users',               COUNT(*) FROM public.users
UNION ALL SELECT 'departments',         COUNT(*) FROM public.departments
UNION ALL SELECT 'teams',               COUNT(*) FROM public.teams
UNION ALL SELECT 'team_members',        COUNT(*) FROM public.team_members
UNION ALL SELECT 'meeting_types',       COUNT(*) FROM public.meeting_types
UNION ALL SELECT 'meetings',            COUNT(*) FROM public.meetings
UNION ALL SELECT 'meeting_attendees',   COUNT(*) FROM public.meeting_attendees
UNION ALL SELECT 'tasks',               COUNT(*) FROM public.tasks
UNION ALL SELECT 'task_workflow',       COUNT(*) FROM public.task_workflow
UNION ALL SELECT 'fulfillments',        COUNT(*) FROM public.fulfillments
UNION ALL SELECT 'fulfillment_rows',    COUNT(*) FROM public.fulfillment_rows
UNION ALL SELECT 'notifications',       COUNT(*) FROM public.notifications
ORDER BY 1;