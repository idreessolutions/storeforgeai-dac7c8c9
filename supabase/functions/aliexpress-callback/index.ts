
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AliExpressTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { auth_code, session_id } = await req.json()

    if (!auth_code) {
      return new Response(
        JSON.stringify({ error: 'Missing auth_code parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing AliExpress OAuth callback with auth_code:', auth_code)

    // AliExpress API credentials from environment
    const clientId = Deno.env.get('ALIEXPRESS_CLIENT_ID')
    const clientSecret = Deno.env.get('ALIEXPRESS_CLIENT_SECRET')
    const redirectUri = Deno.env.get('ALIEXPRESS_REDIRECT_URI')

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing AliExpress OAuth credentials')
      return new Response(
        JSON.stringify({ error: 'OAuth credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Exchange auth_code for access_token
    const tokenRequestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: auth_code
    })

    console.log('Requesting access token from AliExpress...')
    
    const tokenResponse = await fetch('https://oauth.aliexpress.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: tokenRequestBody.toString()
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('AliExpress token request failed:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to exchange auth code for token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const tokenData: AliExpressTokenResponse = await tokenResponse.json()
    console.log('Successfully received access token from AliExpress')

    // Store the access token securely in the database
    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))
    
    const { error: storeError } = await supabase
      .from('aliexpress_tokens')
      .upsert({
        session_id: session_id || 'default',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        scope: tokenData.scope,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      })

    if (storeError) {
      console.error('Failed to store access token:', storeError)
      return new Response(
        JSON.stringify({ error: 'Failed to store access token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Access token stored successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'AliExpress OAuth callback processed successfully',
        expires_at: expiresAt.toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error processing AliExpress OAuth callback:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
