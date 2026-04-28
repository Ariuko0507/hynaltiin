-- Fix the meetings status check constraint to match actual column order
-- The actual table has columns in different order due to ALTER TABLE operations

-- Drop the existing check constraint
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_status_check;

-- Re-add the check constraint with correct status values
ALTER TABLE meetings 
ADD CONSTRAINT meetings_status_check 
CHECK (status IN ('Төлөвлөсөн', 'Баталгаажсан', 'Цуцлагдсан'));
