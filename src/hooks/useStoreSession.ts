
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
      
      // First try to update existing record
      const { error: updateError } = await supabase
        .from('store_builder_sessions')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (updateError) {
        console.log('Update failed, trying insert:', updateError);
        // If update fails, try insert
        const { error: insertError } = await supabase
          .from('store_builder_sessions')
          .insert({
            session_id: sessionId,
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
            ...data,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error inserting session:', insertError);
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
