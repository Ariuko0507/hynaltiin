-- Make user_id nullable to avoid foreign key errors
ALTER TABLE meeting_recordings 
ALTER COLUMN user_id DROP NOT NULL;
