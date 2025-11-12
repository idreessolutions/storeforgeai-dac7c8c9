-- Fix Security Issues for Contact Submissions and Mentorship Applications
-- This migration adds proper RLS policies to prevent data exposure

-- 1. Fix Contact Submissions Security
-- Drop overly permissive policies and add proper restrictions
DROP POLICY IF EXISTS "Service role can view all submissions" ON public.contact_submissions;

-- Only service role and admins should be able to view contact submissions
CREATE POLICY "Only service role can view submissions"
ON public.contact_submissions
FOR SELECT
USING (
  auth.role() = 'service_role'
);

-- Add policy to prevent any direct access from client
CREATE POLICY "No direct client access to contact submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (false);

-- 2. Fix Mentorship Applications Security
-- Remove overly permissive admin policies
DROP POLICY IF EXISTS "Admin only select" ON public.mentorship_applications;
DROP POLICY IF EXISTS "Admin only update" ON public.mentorship_applications;
DROP POLICY IF EXISTS "Admin only delete" ON public.mentorship_applications;

-- Replace with service role only policies
CREATE POLICY "Service role can select all applications"
ON public.mentorship_applications
FOR SELECT
USING (
  auth.role() = 'service_role'
);

CREATE POLICY "Service role can update all applications"
ON public.mentorship_applications
FOR UPDATE
USING (
  auth.role() = 'service_role'
);

CREATE POLICY "Service role can delete all applications"
ON public.mentorship_applications
FOR DELETE
USING (
  auth.role() = 'service_role'
);

-- Ensure users can only read their own data
-- (Keep existing "Users can read own applications only" policy)

-- Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_mentorship_applications_user_id 
ON public.mentorship_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_mentorship_applications_session_id 
ON public.mentorship_applications(session_id);