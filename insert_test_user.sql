-- Insert test user with id=1
INSERT INTO public.users (id, email, name, role) 
OVERRIDING SYSTEM VALUE
VALUES (1, 'test@example.com', 'Test User', 'manager')
ON CONFLICT (id) DO UPDATE SET
    email = excluded.email,
    name = excluded.name,
    role = excluded.role;
