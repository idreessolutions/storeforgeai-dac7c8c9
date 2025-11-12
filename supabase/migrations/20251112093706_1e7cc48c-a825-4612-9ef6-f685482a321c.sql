-- Fix Product Uploads Security Issue
-- Remove overly permissive "Allow all access" policy

-- 1. Drop the dangerous "Allow all access" policy
DROP POLICY IF EXISTS "Allow all access to product_uploads" ON public.product_uploads;

-- 2. The remaining policies are already secure:
-- - "Users can view their own product uploads" (SELECT restricted to own session)
-- - "Users can insert their own product uploads" (INSERT restricted to own session)
-- These policies properly restrict access based on session ownership

-- 3. Add UPDATE and DELETE policies for completeness
CREATE POLICY "Users can update their own product uploads"
ON public.product_uploads
FOR UPDATE
TO authenticated
USING (
  session_id IN (
    SELECT session_id 
    FROM store_builder_sessions 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  session_id IN (
    SELECT session_id 
    FROM store_builder_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own product uploads"
ON public.product_uploads
FOR DELETE
TO authenticated
USING (
  session_id IN (
    SELECT session_id 
    FROM store_builder_sessions 
    WHERE user_id = auth.uid()
  )
);

-- 4. Service role retains full access for admin operations
CREATE POLICY "Service role full access to product uploads"
ON public.product_uploads
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);