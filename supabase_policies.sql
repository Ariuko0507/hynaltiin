-- Enable RLS on fulfillment_comments table
ALTER TABLE fulfillment_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read comments (for demo purposes)
CREATE POLICY "Allow read access to all users" 
  ON fulfillment_comments 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert comments (for demo purposes)
CREATE POLICY "Allow insert access to all users" 
  ON fulfillment_comments 
  FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to delete their own comments (for demo purposes, all users)
CREATE POLICY "Allow delete access to all users" 
  ON fulfillment_comments 
  FOR DELETE 
  USING (true);

-- Allow anyone to update their own comments (for demo purposes, all users)
CREATE POLICY "Allow update access to all users" 
  ON fulfillment_comments 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Alternative: If you want authenticated users only, use this instead:
-- CREATE POLICY "Allow authenticated users to insert" 
--   ON fulfillment_comments 
--   FOR INSERT 
--   TO authenticated 
--   WITH CHECK (true);
--
-- CREATE POLICY "Allow authenticated users to delete" 
--   ON fulfillment_comments 
--   FOR DELETE 
--   TO authenticated 
--   USING (true);
