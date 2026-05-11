-- ============================================================
-- MERGED SCHEMA — Supabase-ready
-- Strategy:
--   • Uses GENERATED ALWAYS AS IDENTITY (Supabase-friendly)
--   • All tables ordered so FK targets exist before referencing tables
--   • Schema 2 wins on diverging columns (it is the newer production DB)
--   • Extra columns from Schema 1 are included where they add value
--   • Mongolian-character CHECK values are dropped; use the clean enum set
--   • Enables Row Level Security stubs so you can add policies easily
-- ============================================================

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE public.roles (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        character varying NOT NULL UNIQUE,
  description text,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. DEPARTMENTS  (no FK to users yet — manager_id added later)
-- ============================================================
CREATE TABLE public.departments (
  id                   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name                 character varying NOT NULL UNIQUE,
  code                 character varying NOT NULL UNIQUE,
  description          text,
  -- Schema 1 extras kept:
  parent_department_id integer REFERENCES public.departments(id),
  level                integer DEFAULT 1,
  is_active            boolean DEFAULT true,
  created_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP
  -- manager_id added below via ALTER after users table exists
);

-- ============================================================
-- 3. USERS
-- ============================================================
CREATE TABLE public.users (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          character varying NOT NULL,
  email         character varying NOT NULL UNIQUE,
  password_hash character varying,
  role_id       integer NOT NULL DEFAULT 1 REFERENCES public.roles(id),
  department_id integer REFERENCES public.departments(id),
  phone         character varying,
  status        character varying NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive','suspended')),
  -- Schema 1 extra:
  position      character varying
                  CHECK (position IN ('director','manager','department_head','team_leader','employee')),
  manager_id    integer REFERENCES public.users(id),
  -- Schema 2 extra:
  role          character varying DEFAULT 'employee',
  viber_id      text,
  is_active     boolean DEFAULT true,
  created_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Now we can add the FK that departments needs:
ALTER TABLE public.departments
  ADD COLUMN manager_id integer REFERENCES public.users(id);

-- ============================================================
-- 4. POSITIONS  (Schema 1 only — useful reference table)
-- ============================================================
CREATE TABLE public.positions (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            character varying NOT NULL UNIQUE,
  description     text,
  level           integer NOT NULL,
  min_reports     integer DEFAULT 0,
  max_reports     integer,
  salary_range_min numeric,
  salary_range_max numeric,
  is_active       boolean DEFAULT true,
  created_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at      timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. HIERARCHY LEVELS  (Schema 1 only)
-- ============================================================
CREATE TABLE public.hierarchy_levels (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  level_number integer NOT NULL UNIQUE,
  title        character varying NOT NULL,
  description  text,
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 6. TEAMS
-- ============================================================
CREATE TABLE public.teams (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_code     character varying NOT NULL UNIQUE,
  name          character varying NOT NULL,
  description   text,
  department_id integer REFERENCES public.departments(id),
  -- Schema 2 uses lead_user_id; Schema 1 uses leader_id — unified as lead_user_id:
  lead_user_id  integer REFERENCES public.users(id),
  is_active     boolean NOT NULL DEFAULT true,
  -- Schema 1 extras:
  created_date  date DEFAULT CURRENT_DATE,
  status        character varying NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','inactive','dissolved')),
  created_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 7. TEAM MEMBERS
-- ============================================================
CREATE TABLE public.team_members (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  team_id      bigint NOT NULL REFERENCES public.teams(id),
  user_id      integer NOT NULL REFERENCES public.users(id),
  -- Schema 2 columns:
  team_role    character varying NOT NULL DEFAULT 'member',
  is_team_lead boolean NOT NULL DEFAULT false,
  joined_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  left_at      timestamp without time zone,
  -- Schema 1 extras:
  position_id  integer REFERENCES public.positions(id),
  joined_date  date DEFAULT CURRENT_DATE,
  left_date    date,
  is_active    boolean DEFAULT true,
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. MANAGEMENT ASSIGNMENTS  (Schema 1 only)
-- ============================================================
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

-- ============================================================
-- 9. REPORTING CHAINS  (Schema 1 only)
-- ============================================================
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

-- ============================================================
-- 10. ORGANIZATIONAL STRUCTURE  (Schema 1 only)
-- ============================================================
CREATE TABLE public.organizational_structure (
  id                    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id               integer NOT NULL REFERENCES public.users(id),
  department_id         integer NOT NULL REFERENCES public.departments(id),
  position_level        integer NOT NULL,
  reporting_to_user_id  integer REFERENCES public.users(id),
  effective_date        date NOT NULL DEFAULT CURRENT_DATE,
  end_date              date,
  is_active             boolean DEFAULT true,
  created_at            timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 11. ORGANIZATIONAL METRICS  (Schema 1 only)
-- ============================================================
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

-- ============================================================
-- 12. ORGANIZATIONAL CHANGES  (Schema 1 only)
-- ============================================================
CREATE TABLE public.organizational_changes (
  id                   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  change_type          character varying NOT NULL
                         CHECK (change_type IN ('user_assigned','user_removed','position_created',
                                                'department_restructured','reporting_changed')),
  user_id              integer REFERENCES public.users(id),
  affected_department_id integer REFERENCES public.departments(id),
  affected_team_id     bigint  REFERENCES public.teams(id),
  old_value            text,
  new_value            text,
  reason               text,
  changed_by           integer NOT NULL REFERENCES public.users(id),
  change_date          timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 13. SPAN OF CONTROL  (Schema 1 only)
-- ============================================================
CREATE TABLE public.span_of_control (
  id                        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  position_id               integer NOT NULL REFERENCES public.positions(id),
  min_direct_reports        integer DEFAULT 0,
  max_direct_reports        integer,
  recommended_direct_reports integer,
  created_at                timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at                timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 14. TRAINING PROGRAMS
-- ============================================================
CREATE TABLE public.training_programs (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  program_code character varying NOT NULL UNIQUE,
  title        character varying NOT NULL,
  description  text,
  level        character varying NOT NULL
                 CHECK (level IN ('beginner','intermediate','advanced')),
  duration_days integer NOT NULL,
  created_by   integer REFERENCES public.users(id),
  status       character varying NOT NULL
                 CHECK (status IN ('draft','published','archived')),
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 15. COURSES
-- ============================================================
CREATE TABLE public.courses (
  id                   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  program_id           integer REFERENCES public.training_programs(id),
  course_code          character varying NOT NULL UNIQUE,
  title                character varying NOT NULL,
  description          text,
  duration_hours       integer NOT NULL,
  prerequisite_course_id integer REFERENCES public.courses(id),
  status               character varying NOT NULL
                         CHECK (status IN ('draft','published','archived')),
  created_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at           timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 16. MODULES
-- ============================================================
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

-- ============================================================
-- 17. LESSONS
-- ============================================================
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

-- ============================================================
-- 18. LEARNING MATERIALS
-- ============================================================
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

-- ============================================================
-- 19. ASSESSMENTS
-- ============================================================
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

-- ============================================================
-- 20. ASSESSMENT RESULTS
-- ============================================================
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

-- ============================================================
-- 21. SESSIONS
-- ============================================================
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
  status       character varying NOT NULL
                 CHECK (status IN ('scheduled','ongoing','completed','cancelled')),
  created_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at   timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 22. ENROLLMENTS
-- ============================================================
CREATE TABLE public.enrollments (
  id              integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         integer NOT NULL REFERENCES public.users(id),
  session_id      integer NOT NULL REFERENCES public.sessions(id),
  enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status          character varying NOT NULL
                    CHECK (status IN ('registered','attended','dropped','completed')),
  progress        integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  final_grade     character varying,
  completed_at    timestamp without time zone
);

-- ============================================================
-- 23. ATTENDANCE RECORDS
-- ============================================================
CREATE TABLE public.attendance_records (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  enrollment_id integer NOT NULL REFERENCES public.enrollments(id),
  meeting_date  date NOT NULL,
  status        character varying NOT NULL
                  CHECK (status IN ('present','absent','late','excused')),
  remarks       text,
  created_at    timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 24. CERTIFICATIONS
-- ============================================================
CREATE TABLE public.certifications (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          integer NOT NULL REFERENCES public.users(id),
  program_id       integer NOT NULL REFERENCES public.training_programs(id),
  certificate_code character varying NOT NULL UNIQUE,
  issued_date      date NOT NULL,
  expires_at       date,
  status           character varying NOT NULL
                     CHECK (status IN ('active','expired','revoked')),
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 25. MEETINGS
-- ============================================================
CREATE TABLE public.meetings (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_code     character varying NOT NULL UNIQUE,
  -- Schema 2 extra identifier kept:
  meeting_id       character varying,
  title            character varying NOT NULL,
  description      text,
  agenda           text,
  organizer_id     integer REFERENCES public.users(id),
  meeting_date     timestamp without time zone NOT NULL,
  location         character varying,
  status           character varying NOT NULL
                     CHECK (status IN ('scheduled','completed','cancelled')),
  -- Schema 2 extras:
  manager_reaction    character varying,
  manager_reaction_at timestamp without time zone,
  manager_comment     text,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 26. MEETING TYPES  (Schema 1 only)
-- ============================================================
CREATE TABLE public.meeting_types (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name             character varying NOT NULL UNIQUE,
  description      text,
  requires_approval boolean DEFAULT false,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 27. MEETING ATTENDEES
-- ============================================================
CREATE TABLE public.meeting_attendees (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meeting_id integer NOT NULL REFERENCES public.meetings(id),
  user_id    integer NOT NULL REFERENCES public.users(id),
  attended   boolean DEFAULT false,
  notes      text
);

-- ============================================================
-- 28. MEETING RECORDINGS
-- ============================================================
CREATE TABLE public.meeting_recordings (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  -- stored as varchar to match both schemas:
  meeting_id       character varying NOT NULL,
  user_id          integer REFERENCES public.users(id),
  file_path        text NOT NULL,
  public_url       text,
  -- Schema 1 extras:
  file_size        integer,
  duration_seconds integer,
  transcription    text,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 29. RECORDINGS
-- ============================================================
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

-- ============================================================
-- 30. TASKS
-- ============================================================
CREATE TABLE public.tasks (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_code        character varying NOT NULL UNIQUE,
  -- Schema 2 extra identifier:
  task_id          character varying,
  title            character varying NOT NULL,
  description      text,
  priority         character varying NOT NULL
                     CHECK (priority IN ('low','medium','high','critical')),
  status           character varying NOT NULL
                     CHECK (status IN ('new','in_progress','completed','cancelled')),
  due_date         date,
  created_by       integer REFERENCES public.users(id),
  assigned_to      integer REFERENCES public.users(id),
  related_course_id integer REFERENCES public.courses(id),
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 31. TASK COMMENTS
-- ============================================================
CREATE TABLE public.task_comments (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id    integer NOT NULL REFERENCES public.tasks(id),
  user_id    integer NOT NULL REFERENCES public.users(id),
  comment    text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 32. TASK DOCUMENT ROWS
-- ============================================================
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

-- ============================================================
-- 33. TASK APPROVALS  (Schema 1 only)
-- ============================================================
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

-- ============================================================
-- 34. TASK WORKFLOW  (Schema 1 only)
-- ============================================================
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

-- ============================================================
-- 35. TASK NOTIFICATIONS  (Schema 1 only)
-- ============================================================
CREATE TABLE public.task_notifications (
  id                integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id           integer NOT NULL REFERENCES public.tasks(id),
  user_id           integer NOT NULL REFERENCES public.users(id),
  notification_type character varying NOT NULL
                      CHECK (notification_type IN ('assigned','review_required','approved',
                                                   'rejected','due_soon','overdue')),
  message           text NOT NULL,
  is_read           boolean DEFAULT false,
  sent_date         timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  read_date         timestamp without time zone,
  created_at        timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 36. WORK ASSIGNMENTS  (Schema 2 only)
-- ============================================================
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
  latest_progress     integer NOT NULL DEFAULT 0
                        CHECK (latest_progress >= 0 AND latest_progress <= 100),
  created_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at          timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 37. ASSIGNMENT UPDATES  (Schema 2 only)
-- ============================================================
CREATE TABLE public.assignment_updates (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  assignment_id    bigint NOT NULL REFERENCES public.work_assignments(id),
  updated_by       integer NOT NULL REFERENCES public.users(id),
  progress_percent integer NOT NULL DEFAULT 0
                     CHECK (progress_percent >= 0 AND progress_percent <= 100),
  status           character varying
                     CHECK (status IN ('pending','in_progress','blocked','completed','overdue','cancelled')),
  note             text,
  attachment_url   text,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 38. FULFILLMENTS
-- ============================================================
CREATE TABLE public.fulfillments (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_code character varying NOT NULL UNIQUE,
  title            character varying NOT NULL,
  description      text,
  status           character varying NOT NULL
                     CHECK (status IN ('sent','approved','rejected','completed')),
  sent_to          integer REFERENCES public.users(id),
  sent_by          integer REFERENCES public.users(id),
  sent_date        date,
  completed_date   date,
  created_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 39. FULFILLMENT ROWS
-- ============================================================
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

-- ============================================================
-- 40. FULFILLMENT COMMENTS
-- ============================================================
CREATE TABLE public.fulfillment_comments (
  id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_id character varying NOT NULL,
  author         character varying NOT NULL,
  role           character varying NOT NULL,
  text           text NOT NULL,
  parent_id      integer REFERENCES public.fulfillment_comments(id),
  created_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 41. FULFILLMENT HISTORY
-- ============================================================
CREATE TABLE public.fulfillment_history (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_id bigint NOT NULL REFERENCES public.fulfillments(id),
  saved_by       integer REFERENCES public.users(id),
  saved_at       timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  snapshot       jsonb NOT NULL
);

-- ============================================================
-- 42. FULFILLMENT LOGS
-- ============================================================
CREATE TABLE public.fulfillment_logs (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fulfillment_id bigint REFERENCES public.fulfillments(id),
  action         text NOT NULL,
  created_by     integer REFERENCES public.users(id),
  created_at     timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 43. NOTIFICATIONS
-- ============================================================
CREATE TABLE public.notifications (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES public.users(id),
  title      character varying NOT NULL,
  message    text NOT NULL,
  type       character varying NOT NULL
               CHECK (type IN ('info','warning','alert','success','comment','meeting')),
  link       character varying,
  is_read    boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 44. USER PERMISSIONS  (Schema 1 only)
-- ============================================================
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

-- ============================================================
-- 45. AUDIT LOGS
-- ============================================================
CREATE TABLE public.audit_logs (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     integer REFERENCES public.users(id),
  action      character varying NOT NULL,
  object_type character varying,
  object_id   integer,
  details     jsonb,
  created_at  timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- OPTIONAL: Enable Row Level Security (flip policies on as needed)
-- ============================================================
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs         ENABLE ROW LEVEL SECURITY;

-- ============================================
-- create storage bucket for meeting recordings
-- ============================================
create storage bucket if not exists "meeting-recordings"
with (public = true);