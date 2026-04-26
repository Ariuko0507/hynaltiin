-- Database Schema for Training and Management System
-- Comprehensive SQL schema for a large training/management application

-- Roles table (эрх)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments table (салбар)
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (хэрэглэгчид)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add department manager relation after users table exists
ALTER TABLE departments
    ADD COLUMN manager_id INTEGER REFERENCES users(id);

-- Training programs table (сургалтын хөтөлбөр)
CREATE TABLE training_programs (
    id SERIAL PRIMARY KEY,
    program_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration_days INTEGER NOT NULL,
    created_by INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table (курс)
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    program_id INTEGER REFERENCES training_programs(id) ON DELETE SET NULL,
    course_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_hours INTEGER NOT NULL,
    prerequisite_course_id INTEGER REFERENCES courses(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules table (модуль)
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, order_index)
);

-- Lessons table (хичээл)
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER REFERENCES modules(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'document', 'quiz', 'live', 'assignment')),
    content_url TEXT,
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, order_index)
);

-- Sessions table (семинар/хуралдаан)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) NOT NULL,
    session_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    organizer_id INTEGER REFERENCES users(id),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    capacity INTEGER,
    status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments table (суудал авсан)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    session_id INTEGER REFERENCES sessions(id) NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('registered', 'attended', 'dropped', 'completed')),
    progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    final_grade VARCHAR(50),
    completed_at TIMESTAMP,
    UNIQUE(user_id, session_id)
);

-- Attendance table (ирц)
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(id) NOT NULL,
    meeting_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments table (үнэлгээ)
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(50) NOT NULL CHECK (assessment_type IN ('quiz', 'project', 'exam', 'assignment')),
    max_score INTEGER NOT NULL,
    passing_score INTEGER NOT NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment results table (үнэлгээний үр дүн)
CREATE TABLE assessment_results (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    score INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'graded', 'failed', 'passed')),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_by INTEGER REFERENCES users(id),
    feedback TEXT,
    UNIQUE(assessment_id, user_id)
);

-- Certifications table (батламж)
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    program_id INTEGER REFERENCES training_programs(id) NOT NULL,
    certificate_code VARCHAR(50) UNIQUE NOT NULL,
    issued_date DATE NOT NULL,
    expires_at DATE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'expired', 'revoked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning materials table (сургалтын материал)
CREATE TABLE learning_materials (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    material_type VARCHAR(50) NOT NULL CHECK (material_type IN ('document', 'video', 'link', 'slides', 'ebook')),
    url TEXT NOT NULL,
    description TEXT,
    uploaded_by INTEGER REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table (даалгаварууд)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    task_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('new', 'in_progress', 'completed', 'cancelled')),
    due_date DATE,
    created_by INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    related_course_id INTEGER REFERENCES courses(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task comments table (даалгаврын тайлбар)
CREATE TABLE task_comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meetings table (хурал)
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    meeting_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    agenda TEXT,
    organizer_id INTEGER REFERENCES users(id),
    meeting_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meeting attendees table (хуралд оролцогч)
CREATE TABLE meeting_attendees (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER REFERENCES meetings(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    attended BOOLEAN DEFAULT FALSE,
    notes TEXT,
    UNIQUE(meeting_id, user_id)
);

-- Fulfillments table (биелүүлэлт)
CREATE TABLE fulfillments (
    id SERIAL PRIMARY KEY,
    fulfillment_code VARCHAR(30) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'approved', 'rejected', 'completed')),
    sent_to INTEGER REFERENCES users(id),
    sent_by INTEGER REFERENCES users(id),
    sent_date DATE,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fulfillment comments table (биелүүлэлтийн сэтгэгдэл)
CREATE TABLE fulfillment_comments (
    id SERIAL PRIMARY KEY,
    fulfillment_id VARCHAR(30) NOT NULL,
    author VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    parent_id INTEGER REFERENCES fulfillment_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_fulfillment_comments_fulfillment_id ON fulfillment_comments(fulfillment_id);
CREATE INDEX idx_fulfillment_comments_parent_id ON fulfillment_comments(parent_id);

-- Notifications table (мэдэгдэл)
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'alert', 'success')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table (аудит лог)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    object_type VARCHAR(100),
    object_id INTEGER,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_sessions_course_id ON sessions(course_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_session_id ON enrollments(session_id);
CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX idx_assessment_results_assessment_id ON assessment_results(assessment_id);
CREATE INDEX idx_course_materials_course_id ON learning_materials(course_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Sample data insertion
INSERT INTO roles (name, description) VALUES
('admin', 'System administrator with all permissions'),
('director', 'Department director and program owner'),
('manager', 'Manager responsible for teams and schedules'),
('employee', 'Standard user attending trainings');

INSERT INTO departments (name, code, description) VALUES
('Админ', 'ADM', 'Админ салбар'),
('Удирдах', 'DIR', 'Удирдах зөвлөл'),
('Менежмент', 'MNG', 'Менежментийн хэсэг'),
('Үйл ажиллагаа', 'OPS', 'Үйл ажиллагаа');

INSERT INTO users (name, email, password_hash, role_id, department_id, phone, status) VALUES
('Админ Бат', 'admin@example.com', 'hash1', 1, 1, '+976-90000001', 'active'),
('Директор Энх', 'director@example.com', 'hash2', 2, 2, '+976-90000002', 'active'),
('Менежер Тэмүүжин', 'manager@example.com', 'hash3', 3, 3, '+976-90000003', 'active'),
('Ажилтан Сарнай', 'employee@example.com', 'hash4', 4, 4, '+976-90000004', 'active');

INSERT INTO training_programs (program_code, title, description, level, duration_days, created_by, status) VALUES
('TP-001', 'Менежментийн үндэс', 'Менежмент, харилцаа, удирдлагын сургалт', 'beginner', 20, 2, 'published'),
('TP-002', 'Сургалтын системийн удирдлага', 'Сургалтын платформ хөгжүүлэх, удирдах', 'intermediate', 30, 1, 'published');

INSERT INTO courses (program_id, course_code, title, description, duration_hours, status) VALUES
(1, 'C-101', 'Төслийн менеджмент', 'Төслийн явц удирдах аргачлал', 40, 'published'),
(1, 'C-102', 'Багийн харилцаа', 'Багийн дотоод харилцаа ба удирдлага', 24, 'published'),
(2, 'C-201', 'Сургалтын платформ', 'Supabase болон Next.js ашиглан сургалтын систем хөгжүүлэх', 48, 'published');

INSERT INTO modules (course_id, title, description, order_index, duration_minutes) VALUES
(1, 'Төслийн төлөвлөлт', 'Төслийн хүрээ, зорилго тодорхойлох', 1, 180),
(1, 'Ресурс удирдлага', 'Хүний нөөц ба цагийн менежмент', 2, 150),
(2, 'Харилцааны суурь', 'Ажилтнуудын харилцааны ур чадвар', 1, 120),
(3, 'Технологийн архитектур', 'Сургалтын системийн архитектур зураг', 1, 200);

INSERT INTO lessons (module_id, title, content_type, content_url, duration_minutes, order_index) VALUES
(1, 'Хүрээ тодорхойлолт', 'document', 'https://example.com/lesson1.pdf', 45, 1),
(1, 'Зорилт тогтоох', 'video', 'https://example.com/lesson2.mp4', 60, 2),
(3, 'Сурлагын загвар', 'document', 'https://example.com/lesson3.pdf', 40, 1),
(4, 'Сургалтын системийн хяналт', 'live', 'https://meet.example.com/session1', 90, 1);

INSERT INTO sessions (course_id, session_code, title, description, location, organizer_id, start_date, end_date, capacity, status) VALUES
(1, 'S-101', 'Төслийн менежмент I', 'Эхний шатны сургалт', 'Улаанбаатар оффис', 3, '2026-05-01 09:00:00', '2026-05-05 17:00:00', 25, 'scheduled'),
(2, 'S-102', 'Багийн харилцаа', 'Харилцааны сургалт', 'Онлайн', 3, '2026-05-10 10:00:00', '2026-05-12 16:00:00', 30, 'scheduled'),
(3, 'S-201', 'Сургалтын платформ хөгжүүлэлт', 'Систем хөгжүүлэх практик', 'Үйлчилгээний төв', 1, '2026-06-01 09:00:00', '2026-06-10 17:00:00', 20, 'scheduled');

INSERT INTO enrollments (user_id, session_id, status, progress) VALUES
(4, 1, 'registered', 15),
(4, 2, 'registered', 0),
(3, 1, 'registered', 50);

INSERT INTO assessments (course_id, title, assessment_type, max_score, passing_score, due_date) VALUES
(1, 'Төслийн төлөвлөгөөний шалгалт', 'exam', 100, 70, '2026-05-05'),
(2, 'Харилцааны үнэлгээ', 'quiz', 50, 35, '2026-05-12');

INSERT INTO assessment_results (assessment_id, user_id, score, status, graded_by, feedback) VALUES
(1, 4, 78, 'passed', 3, 'Сайхан боловсруулсан. Хүртээ тайлбар сайн.'),
(2, 4, 42, 'passed', 3, 'Илүү анхааралтай ажилласан.');

INSERT INTO certifications (user_id, program_id, certificate_code, issued_date, expires_at, status) VALUES
(4, 1, 'CERT-1001', '2026-06-15', '2028-06-15', 'active');

INSERT INTO learning_materials (course_id, title, material_type, url, description, uploaded_by) VALUES
(1, 'Төслийн менежмент гарын авлага', 'document', 'https://example.com/guide.pdf', 'Төслийн менежментийн үндэс', 3),
(3, 'Next.js сургалтын загвар', 'link', 'https://example.com/course-material', 'Сургалтын платформын жишээ', 1);

INSERT INTO tasks (task_code, title, description, priority, status, due_date, created_by, assigned_to, related_course_id) VALUES
('T-1001', 'Сургалтын материалыг шинэчлэх', 'Сургалтын платформын хичээлүүдийг шинэчлэх', 'high', 'in_progress', '2026-05-01', 1, 3, 3),
('T-1002', 'Харилцааны хичээлийн тайлан боловсруулах', 'Сургалт дууссаны дараа тайлан гаргах', 'medium', 'new', '2026-05-15', 3, 4, 2);

INSERT INTO meetings (meeting_code, title, agenda, organizer_id, meeting_date, location, status) VALUES
('MT-001', 'Сургалтын төслийн уулзалт', 'Сургалтын явцыг хянах', 2, '2026-04-20 14:00:00', 'Өрөө 301', 'scheduled'),
('MT-002', 'Сургалтын хяналтын хурал', 'Оролцогчдын прогресс хянах', 1, '2026-05-03 10:00:00', 'Онлайн', 'scheduled');

INSERT INTO meeting_attendees (meeting_id, user_id, attended) VALUES
(1, 1, FALSE),
(1, 2, FALSE),
(1, 3, FALSE),
(2, 3, FALSE),
(2, 4, FALSE);

INSERT INTO fulfillments (fulfillment_code, title, description, status, sent_to, sent_by, sent_date) VALUES
('F-1001', 'Тоног төхөөрөмж нийлүүлэх', 'Сургалтын компьютерүүдийг бэлтгэх', 'sent', 3, 1, '2026-04-18'),
('F-1002', 'Материал хэвлэх', 'Сургалтын номын материал хэвлэх', 'approved', 4, 1, '2026-04-19');

INSERT INTO notifications (user_id, title, message, type) VALUES
(4, 'Сургалт эхлэхэд бэлтгэлтэй бай', 'Танай S-101 семинар 2026-05-01-нд эхэлнэ.', 'info'),
(3, 'Тасалбар шинэчлэгдэв', 'Танд шинэ даалгавар хуваарилагдлаа.', 'success');

INSERT INTO audit_logs (user_id, action, object_type, object_id, details) VALUES
(1, 'create', 'training_program', 1, '{"title": "Менежментийн үндэс"}'),
(3, 'assign', 'task', 1, '{"assigned_to": 3}');
