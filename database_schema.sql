-- Meeting Recordings Table
CREATE TABLE meeting_recordings (
    id SERIAL PRIMARY KEY,
    meeting_id VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    file_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_size INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX idx_meeting_recordings_user_id ON meeting_recordings(user_id);

-- RLS Policies for meeting_recordings
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on meeting_recordings"
  ON meeting_recordings FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for meeting recordings (run in Supabase dashboard SQL editor)
-- Note: Buckets can only be created via Supabase dashboard or API, not via SQL
-- Go to: Storage > New Bucket > Name: "meeting-recordings", Public: true
