-- COMPLETE RLS FIX for meeting_recordings

-- Step 1: Check if RLS is enabled and disable it completely
ALTER TABLE IF EXISTS meeting_recordings DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies (clean slate)
DROP POLICY IF EXISTS "Allow all operations on meeting_recordings" ON meeting_recordings;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON meeting_recordings;
DROP POLICY IF EXISTS "Enable all for anon" ON meeting_recordings;
DROP POLICY IF EXISTS "Enable insert for anon" ON meeting_recordings;

-- Step 3: Enable RLS back with proper policies
ALTER TABLE IF EXISTS meeting_recordings ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy for anon (unauthenticated users)
CREATE POLICY "Enable all for anon" 
ON meeting_recordings 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Step 5: Create policy for authenticated users
CREATE POLICY "Enable all for authenticated" 
ON meeting_recordings 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Verify: Check RLS status
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'meeting_recordings';
