
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StoreSession {
  id?: string;
  session_id: string;
  niche: string;
  target_audience: string;
  business_type: string;
  store_style: string;
  additional_info: string;
  shopify_url: string;
  access_token: string;
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

  const saveSessionData = async (data: Partial<StoreSession>) => {
    try {
      console.log('Saving session data:', data);
      const { error } = await supabase
        .from('store_builder_sessions')
        .upsert({
          session_id: sessionId,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving session:', error);
      } else {
        console.log('Session saved successfully');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const getSessionData = async (): Promise<StoreSession | null> => {
    try {
      console.log('Getting session data for:', sessionId);
      const { data, error } = await supabase
        .from('store_builder_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      console.log('Session data retrieved:', data);
      return data as StoreSession;
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
