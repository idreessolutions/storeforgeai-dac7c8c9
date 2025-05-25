
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface StoreSession {
  id?: string;
  sessionId: string;
  niche: string;
  targetAudience: string;
  businessType: string;
  storeStyle: string;
  additionalInfo: string;
  shopifyUrl: string;
  accessToken: string;
  planActivated: boolean;
  themeColor: string;
  productsAdded: boolean;
  mentorshipRequested: boolean;
  completedSteps: number;
  createdViaAffiliate: boolean;
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
      const { error } = await supabase
        .from('store_builder_sessions')
        .upsert({
          session_id: sessionId,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving session:', error);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const getSessionData = async (): Promise<StoreSession | null> => {
    try {
      const { data, error } = await supabase
        .from('store_builder_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

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
