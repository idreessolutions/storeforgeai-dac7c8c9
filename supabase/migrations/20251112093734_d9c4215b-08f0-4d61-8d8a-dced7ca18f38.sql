-- Remove the view to address Security Definer View warning
-- Instead, client code will explicitly select columns without access_token

DROP VIEW IF EXISTS public.store_builder_sessions_safe;

-- Revoke permissions that were granted to the view
-- (No action needed since view is dropped)

-- Note: Client code should now explicitly list columns in SELECT queries,
-- excluding access_token to maintain security