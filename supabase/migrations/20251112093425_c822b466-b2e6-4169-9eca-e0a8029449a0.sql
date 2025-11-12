-- Fix the overly restrictive policy from previous migration
-- Allow clients to SELECT but guide them to use the safe view

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Users can view their own sessions (no tokens)" ON public.store_builder_sessions;

-- Restore the original SELECT policy
CREATE POLICY "Users can view their own sessions"
ON public.store_builder_sessions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- The protection comes from:
-- 1. Client code should use store_builder_sessions_safe view (which excludes tokens)
-- 2. Security definer functions for backend token access
-- 3. Service role retains full access for edge functions