-- Run this entire file in Supabase SQL Editor in ONE go
-- This sets up all notifications data in correct order

-- 1. Add link column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'link') THEN
        ALTER TABLE notifications ADD COLUMN link VARCHAR(500);
    END IF;
END $$;

-- 2. Insert roles (skip if exists)
INSERT INTO roles (name, description) VALUES
('admin', 'System administrator'),
('director', 'Department director'),
('manager', 'Team manager'),
('employee', 'Standard employee')
ON CONFLICT DO NOTHING;

-- 3. Insert departments (skip if exists)
INSERT INTO departments (name, code, description) VALUES
('Админ', 'ADM', 'Admin department'),
('Удирдах', 'DIR', 'Director department'),
('Менежмент', 'MNG', 'Management'),
('Үйл ажиллагаа', 'OPS', 'Operations')
ON CONFLICT DO NOTHING;

-- 4. Insert users (skip if exists)
INSERT INTO users (name, email, password_hash, role_id, department_id, phone, status) VALUES
('Админ Бат', 'admin@example.com', 'hash1', 1, 1, '+976-90000001', 'active'),
('Директор Энх', 'director@example.com', 'hash2', 2, 2, '+976-90000002', 'active'),
('Менежер Тэмүүжин', 'manager@example.com', 'hash3', 3, 3, '+976-90000003', 'active'),
('Ажилтан Сарнай', 'employee@example.com', 'hash4', 4, 4, '+976-90000004', 'active')
ON CONFLICT DO NOTHING;

-- 5. Insert notifications for Director
INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Шинэ биелэлт ирлээ', 'Менежер Тэмүүжин F-003 биелэлтийг илгээв.', 'info', '/director/fulfillment?fulfillment_id=F-003', false, '2026-04-26 10:30:00'
FROM users u WHERE u.email = 'director@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Хурал эхлэх гэж байна', 'Төслийн тойм хурал 15 минутын дараа эхэлнэ.', 'warning', '/director/meeting', false, '2026-04-26 14:45:00'
FROM users u WHERE u.email = 'director@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Даалгавар батлагдлаа', 'Баталгаатай даалгавар D-104.', 'success', '/director/tasks', true, '2026-04-25 09:00:00'
FROM users u WHERE u.email = 'director@example.com'
ON CONFLICT DO NOTHING;

-- 6. Insert notifications for Manager
INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Шинэ даалгавар өгөгдлөө', 'Директор Энх танаас шинэ даалгавар өглөө.', 'info', '/manager/tasks', false, '2026-04-26 11:00:00'
FROM users u WHERE u.email = 'manager@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Багийн гишүүн биелэлт илгээв', 'Бат F-004 биелэлтийг илгээв.', 'success', '/manager/fulfillment?fulfillment_id=F-004', false, '2026-04-26 13:20:00'
FROM users u WHERE u.email = 'manager@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Хугацаа дуусах гэж байна', 'M-301 даалгаварын хугацаа маргааш дуусна.', 'warning', '/manager/tasks', true, '2026-04-26 16:00:00'
FROM users u WHERE u.email = 'manager@example.com'
ON CONFLICT DO NOTHING;

-- 7. Insert notifications for Employee
INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Шинэ даалгавар ирлээ', 'Менежер Тэмүүжин танаас E-501 даалгавар өглөө.', 'info', '/employee/tasks', false, '2026-04-26 09:00:00'
FROM users u WHERE u.email = 'employee@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Хуралд урив', 'Таныг багийн хуралд оролцохыг урьж байна.', 'info', '/employee/meeting', false, '2026-04-26 10:15:00'
FROM users u WHERE u.email = 'employee@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Биелэлт батлагдлаа', 'Таны илгээсэн F-002 биелэлт батлагдлаа.', 'success', '/employee/fulfillment?fulfillment_id=F-002', true, '2026-04-25 15:30:00'
FROM users u WHERE u.email = 'employee@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, type, link, is_read, created_at)
SELECT u.id, 'Хугацаа сануулга', 'E-502 даалгаварын хугацаа маргааш дуусна.', 'warning', '/employee/tasks', false, '2026-04-26 17:00:00'
FROM users u WHERE u.email = 'employee@example.com'
ON CONFLICT DO NOTHING;

-- 8. Enable RLS and add policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to all users on notifications" ON notifications;
CREATE POLICY "Allow read access to all users on notifications" 
  ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to all users on notifications" ON notifications;
CREATE POLICY "Allow insert access to all users on notifications" 
  ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to all users on notifications" ON notifications;
CREATE POLICY "Allow update access to all users on notifications" 
  ON notifications FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow delete access to all users on notifications" ON notifications;
CREATE POLICY "Allow delete access to all users on notifications" 
  ON notifications FOR DELETE USING (true);
