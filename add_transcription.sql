-- Add transcription column to meeting_recordings table
ALTER TABLE meeting_recordings 
ADD COLUMN transcription TEXT;
