-- Fix Mentorship Applications Security Issue (Without Breaking Existing Data)
-- Prevent unauthorized access to customer personal data

-- 1. Drop the overly permissive insert policy that allows any authenticated user
DROP POLICY IF EXISTS "Secure insert for authenticated users" ON public.mentorship_applications;

-- Note: We keep user_id as nullable to preserve existing data with NULL user_id
-- Those NULL user_id rows are already secure (not accessible to regular users)

-- 2. The security model is now:
-- - "Users can insert own applications only" ensures new inserts have matching user_id
-- - "Users can read own applications only" ensures users only see their own data
-- - "Service role full access" allows admin access only
-- - Existing NULL user_id applications are inaccessible to regular users (secure)

-- 3. Add index for performance
CREATE INDEX IF NOT EXISTS idx_mentorship_applications_created_at 
ON public.mentorship_applications(created_at DESC);