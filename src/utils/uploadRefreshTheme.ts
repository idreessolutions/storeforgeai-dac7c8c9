import { supabase } from "@/integrations/supabase/client";

/**
 * Upload the Refresh theme ZIP to Supabase Storage
 * This should be called once to upload the theme file
 */
export async function uploadRefreshThemeZip(file: File) {
  console.log('📤 Uploading Refresh theme to Supabase Storage...');
  
  try {
    const { data, error } = await supabase.storage
      .from('themes')
      .upload('refresh/refresh.zip', file, {
        contentType: 'application/zip',
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }

    console.log('✅ Theme uploaded successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Upload error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verify the Refresh theme exists in storage
 */
export async function verifyRefreshThemeExists() {
  try {
    const { data, error } = await supabase.storage
      .from('themes')
      .list('refresh', {
        limit: 10,
        search: 'refresh.zip',
      });

    if (error) throw error;

    const exists = data?.some(file => file.name === 'refresh.zip');
    console.log(exists ? '✅ Refresh theme found in storage' : '❌ Refresh theme not found in storage');
    
    return exists;
  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  }
}
