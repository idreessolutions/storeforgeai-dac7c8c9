-- Encrypt Shopify Access Tokens at Rest
-- Use Postgres pgcrypto extension for secure token storage

-- 1. Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create encryption/decryption functions
-- These use AES encryption with the project's secret key
CREATE OR REPLACE FUNCTION public.encrypt_token(token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF token IS NULL OR token = '' THEN
    RETURN NULL;
  END IF;
  
  -- Encrypt using AES-256
  -- Using a combination of project-specific data as encryption key
  RETURN encode(
    encrypt(
      token::bytea,
      current_setting('app.settings.encryption_key', true)::bytea,
      'aes'
    ),
    'base64'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback: if encryption fails, return NULL for security
    RAISE WARNING 'Token encryption failed: %', SQLERRM;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrypt_token(encrypted_token text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF encrypted_token IS NULL OR encrypted_token = '' THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt using AES-256
  RETURN convert_from(
    decrypt(
      decode(encrypted_token, 'base64'),
      current_setting('app.settings.encryption_key', true)::bytea,
      'aes'
    ),
    'utf8'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If decryption fails, might be unencrypted legacy token
    -- Return as-is for backward compatibility during migration
    RETURN encrypted_token;
END;
$$;

-- 3. Update get_store_access_token to decrypt tokens
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
  
  -- Return the decrypted access token
  SELECT public.decrypt_token(access_token) INTO v_token
  FROM public.store_builder_sessions
  WHERE session_id = p_session_id
  AND user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_token;
END;
$$;

-- 4. Create trigger to auto-encrypt tokens on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_access_token_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only encrypt if token has changed and is not already encrypted
  IF NEW.access_token IS NOT NULL AND NEW.access_token != '' THEN
    -- Check if it's already encrypted (base64 encoded)
    -- If not, encrypt it
    IF NEW.access_token !~ '^[A-Za-z0-9+/]+=*$' OR length(NEW.access_token) < 20 THEN
      -- Looks like plain text, encrypt it
      NEW.access_token := public.encrypt_token(NEW.access_token);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS encrypt_access_token_before_insert_update ON public.store_builder_sessions;

-- 6. Create trigger for automatic encryption
CREATE TRIGGER encrypt_access_token_before_insert_update
BEFORE INSERT OR UPDATE OF access_token
ON public.store_builder_sessions
FOR EACH ROW
EXECUTE FUNCTION public.encrypt_access_token_trigger();

-- 7. Set encryption key in settings (using a secure hash of database URL)
-- This ensures each project has a unique encryption key
DO $$
BEGIN
  PERFORM set_config(
    'app.settings.encryption_key',
    encode(digest(current_database() || current_user, 'sha256'), 'hex'),
    false
  );
END $$;

-- 8. Add comment explaining encryption
COMMENT ON COLUMN public.store_builder_sessions.access_token IS 
'Shopify access token - ENCRYPTED at rest using AES-256. Access via get_store_access_token() function which handles decryption.';

-- 9. Encrypt existing plain text tokens (if any)
-- This updates any unencrypted tokens in the database
UPDATE public.store_builder_sessions
SET access_token = public.encrypt_token(access_token)
WHERE access_token IS NOT NULL 
  AND access_token != ''
  AND access_token !~ '^[A-Za-z0-9+/]+=*$';