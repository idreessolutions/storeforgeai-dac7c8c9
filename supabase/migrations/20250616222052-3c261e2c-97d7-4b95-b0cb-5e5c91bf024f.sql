
-- Create table to store AliExpress OAuth tokens
CREATE TABLE public.aliexpress_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  scope TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.aliexpress_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access (needed for edge functions)
CREATE POLICY "Service role can manage all tokens" 
  ON public.aliexpress_tokens 
  FOR ALL 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_aliexpress_tokens_session_id ON public.aliexpress_tokens(session_id);
CREATE INDEX idx_aliexpress_tokens_expires_at ON public.aliexpress_tokens(expires_at);
