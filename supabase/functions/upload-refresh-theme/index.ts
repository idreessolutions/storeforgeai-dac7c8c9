import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 Uploading Refresh theme to Supabase Storage...');

    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`📦 Received file: ${file.name}, size: ${file.size} bytes`);

    // Upload to storage
    const { data, error } = await supabase.storage
      .from('themes')
      .upload('refresh/refresh.zip', file, {
        contentType: 'application/zip',
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error('❌ Storage upload error:', error);
      throw error;
    }

    console.log('✅ Theme uploaded successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        path: data.path,
        message: 'Refresh theme uploaded successfully to Supabase Storage',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Upload error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
