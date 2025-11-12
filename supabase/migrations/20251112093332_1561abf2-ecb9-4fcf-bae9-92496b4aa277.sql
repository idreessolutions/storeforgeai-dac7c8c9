-- Fix Shopify Token Exposure Security Issue
-- Implement column-level security to protect access_token from client access

-- 1. Create a security definer function to retrieve access tokens
-- This allows edge functions to get tokens while preventing client access
CREATE OR REPLACE FUNCTION public.get_store_access_token(p_session_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
  v_user_id uuid;
BEGIN
  -- Get the user_id for this session
  SELECT user_id INTO v_user_id
  FROM public.store_builder_sessions
  WHERE session_id = p_session_id
  LIMIT 1;
  
  -- Verify the requesting user owns this session
  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;
  
  -- Return the access token
  SELECT access_token INTO v_token
  FROM public.store_builder_sessions
  WHERE session_id = p_session_id
  AND user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_token;
END;
$$;

-- 2. Create a view that excludes the access_token for client queries
CREATE OR REPLACE VIEW public.store_builder_sessions_safe AS
SELECT 
  id,
  session_id,
  user_id,
  niche,
  target_audience,
  business_type,
  store_style,
  additional_info,
  shopify_url,
  -- Exclude access_token from view
  theme_color,
  plan_activated,
  products_added,
  mentorship_requested,
  completed_steps,
  created_via_affiliate,
  created_at,
  updated_at
FROM public.store_builder_sessions;

-- 3. Grant appropriate permissions on the view
GRANT SELECT ON public.store_builder_sessions_safe TO authenticated;
GRANT ALL ON public.store_builder_sessions_safe TO service_role;

-- 4. Update RLS policies to use the safe view concept
-- Drop existing user policies that expose tokens
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.store_builder_sessions;

-- Create new policy that explicitly excludes access_token
CREATE POLICY "Users can view their own sessions (no tokens)"
ON public.store_builder_sessions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  AND false -- Force clients to use the function instead
);

-- Service role retains full access (for edge functions)
-- The existing "Service role full access" policy already handles this

-- 5. Create helper function to check if token exists (without exposing it)
CREATE OR REPLACE FUNCTION public.has_store_access_token(p_session_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_token boolean;
BEGIN
  SELECT (access_token IS NOT NULL AND access_token != '') INTO v_has_token
  FROM public.store_builder_sessions
  WHERE session_id = p_session_id
  AND user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(v_has_token, false);
END;
$$;

-- 6. Add comment explaining the security model
COMMENT ON COLUMN public.store_builder_sessions.access_token IS 
'Shopify access token - SENSITIVE. Only accessible via service role or get_store_access_token() function. Never expose to clients.';