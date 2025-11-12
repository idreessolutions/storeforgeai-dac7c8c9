import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StoreSession {
  id?: string;
  session_id: string;
  user_id?: string;
  niche: string;
  target_audience: string;
  business_type: string;
  store_style: string;
  additional_info: string;
  shopify_url: string;
  access_token?: string; // Optional - not exposed in client queries for security
  plan_activated: boolean;
  theme_color: string;
  products_added: boolean;
  mentorship_requested: boolean;
  completed_steps: number;
  created_via_affiliate: boolean;
}

export const useStoreSession = () => {
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('storeBuilderSessionId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('storeBuilderSessionId', id);
    }
    return id;
  });

  const saveSessionData = async (sessionData: Partial<StoreSession>) => {
    try {
      // Get current user
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data?.user;
      
      if (!user) {
        console.error('User must be authenticated to save session data');
        throw new Error('Authentication required');
      }

      console.log('Saving session data:', sessionData);
      
      // First try to update existing record
      const updateData: Record<string, any> = {};
      if (sessionData.niche !== undefined) updateData.niche = sessionData.niche;
      if (sessionData.target_audience !== undefined) updateData.target_audience = sessionData.target_audience;
      if (sessionData.business_type !== undefined) updateData.business_type = sessionData.business_type;
      if (sessionData.store_style !== undefined) updateData.store_style = sessionData.store_style;
      if (sessionData.additional_info !== undefined) updateData.additional_info = sessionData.additional_info;
      if (sessionData.shopify_url !== undefined) updateData.shopify_url = sessionData.shopify_url;
      if (sessionData.access_token !== undefined) updateData.access_token = sessionData.access_token;
      if (sessionData.plan_activated !== undefined) updateData.plan_activated = sessionData.plan_activated;
      if (sessionData.theme_color !== undefined) updateData.theme_color = sessionData.theme_color;
      if (sessionData.products_added !== undefined) updateData.products_added = sessionData.products_added;
      if (sessionData.mentorship_requested !== undefined) updateData.mentorship_requested = sessionData.mentorship_requested;
      if (sessionData.completed_steps !== undefined) updateData.completed_steps = sessionData.completed_steps;
      if (sessionData.created_via_affiliate !== undefined) updateData.created_via_affiliate = sessionData.created_via_affiliate;
      updateData.updated_at = new Date().toISOString();

      const updateResult = await (supabase as any)
        .from('store_builder_sessions')
        .update(updateData)
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (updateResult.error) {
        console.log('Update failed, trying insert:', updateResult.error);
        // If update fails, try insert
        const insertData = {
          session_id: sessionId,
          user_id: user.id,
          niche: '',
          target_audience: '',
          business_type: '',
          store_style: '',
          additional_info: '',
          shopify_url: '',
          access_token: '',
          plan_activated: false,
          theme_color: '#1E40AF',
          products_added: false,
          mentorship_requested: false,
          completed_steps: 0,
          created_via_affiliate: false,
          ...sessionData,
          updated_at: new Date().toISOString()
        };
        
        const insertResult = await (supabase as any)
          .from('store_builder_sessions')
          .insert(insertData);

        if (insertResult.error) {
          console.error('Error inserting session:', insertResult.error);
        } else {
          console.log('Session inserted successfully');
        }
      } else {
        console.log('Session updated successfully');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const getSessionData = async (): Promise<StoreSession | null> => {
    try {
      // Get current user
      const userResponse = await supabase.auth.getUser();
      const user = userResponse.data?.user;
      
      if (!user) {
        console.error('User must be authenticated to access session data');
        return null;
      }

      console.log('Getting session data for:', sessionId);
      // Explicitly select columns excluding access_token for security
      const result = await (supabase as any)
        .from('store_builder_sessions')
        .select('id, session_id, user_id, niche, target_audience, business_type, store_style, additional_info, shopify_url, theme_color, plan_activated, products_added, mentorship_requested, completed_steps, created_via_affiliate, created_at, updated_at')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (result.error) {
        console.error('Error getting session:', result.error);
        return null;
      }

      console.log('Session data retrieved:', result.data);
      return result.data as StoreSession;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  };

  return {
    sessionId,
    saveSessionData,
    getSessionData
  };
};