-- Add last_questions_reset column to track when a user's questions were last reset
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_questions_reset TIMESTAMP WITH TIME ZONE;

-- Update the default questions limit for free users (25 questions)
-- We'll use this in our application logic
-- The FREE_TIER_QUESTIONS_LIMIT constant will be set to 25 in the code

-- Add answer column to questions table to store AI responses
ALTER TABLE questions ADD COLUMN IF NOT EXISTS answer TEXT;

-- Create function to increment questions count
CREATE OR REPLACE FUNCTION increment_count(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Get current count
  SELECT questions_count INTO current_count FROM profiles WHERE id = row_id;
  
  -- If null, set to 0
  IF current_count IS NULL THEN
    current_count := 0;
  END IF;
  
  -- Increment and return
  current_count := current_count + 1;
  
  -- Update the record
  UPDATE profiles SET questions_count = current_count WHERE id = row_id;
  
  RETURN current_count;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to reset questions count after 3 days
CREATE OR REPLACE FUNCTION reset_questions_if_needed()
RETURNS TRIGGER AS $$
DECLARE
  days_since_reset INTEGER;
BEGIN
  -- If last_questions_reset is null, set it to current time
  IF NEW.last_questions_reset IS NULL THEN
    NEW.last_questions_reset := NOW();
  END IF;
  
  -- Calculate days since last reset
  days_since_reset := EXTRACT(DAY FROM NOW() - NEW.last_questions_reset);
  
  -- If it's been 3 or more days, reset the questions count and update last_questions_reset
  IF days_since_reset >= 3 THEN
    NEW.questions_count := 0;
    NEW.last_questions_reset := NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check and reset questions count when profile is read
DROP TRIGGER IF EXISTS trigger_reset_questions ON profiles;
CREATE TRIGGER trigger_reset_questions
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION reset_questions_if_needed(); 