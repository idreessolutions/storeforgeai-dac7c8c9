
import { supabase } from "@/integrations/supabase/client";

export interface AutomationResult {
  session_id: string;
  execution_date: string;
  stores_processed: number;
  stores_successful: number;
  total_products_added: number;
  results: Array<{
    session_id: string;
    niche: string;
    shopify_url: string;
    success: boolean;
    products_added: number;
    error?: string;
  }>;
}

export class AutomationService {
  
  // Trigger daily automation manually (for testing)
  static async triggerDailyAutomation(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('🚀 Triggering daily automation manually...');
      
      const { data, error } = await supabase.functions.invoke('daily-product-automation', {
        body: { manual_trigger: true }
      });

      if (error) {
        console.error('Daily automation trigger failed:', error);
        return {
          success: false,
          message: `Automation failed: ${error.message}`
        };
      }

      console.log('✅ Daily automation completed:', data);
      return {
        success: true,
        message: data?.message || 'Daily automation completed successfully',
        data: data
      };
    } catch (error) {
      console.error('Error triggering daily automation:', error);
      return {
        success: false,
        message: `Automation error: ${error.message}`
      };
    }
  }

  // Get automation history
  static async getAutomationHistory(limit: number = 30): Promise<AutomationResult[]> {
    try {
      const { data, error } = await supabase
        .from('automation_results' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch automation history:', error);
        return [];
      }

      return (data as any[])?.map(row => ({
        session_id: row.session_id,
        execution_date: row.execution_date,
        stores_processed: row.stores_processed,
        stores_successful: row.stores_successful,
        total_products_added: row.total_products_added,
        results: row.results || []
      })) || [];
    } catch (error) {
      console.error('Error fetching automation history:', error);
      return [];
    }
  }

  // Get today's automation status
  static async getTodaysAutomationStatus(): Promise<{
    completed: boolean;
    stores_processed: number;
    products_added: number;
    last_run?: string;
  }> {
    try {
      const today = new Date().toDateString();
      const { data, error } = await supabase
        .from('automation_results' as any)
        .select('*')
        .gte('created_at', new Date(today).toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Failed to fetch today\'s automation status:', error);
        return { completed: false, stores_processed: 0, products_added: 0 };
      }

      const todayResult = (data as any[])?.[0];
      return {
        completed: !!todayResult,
        stores_processed: todayResult?.stores_processed || 0,
        products_added: todayResult?.total_products_added || 0,
        last_run: todayResult?.execution_date
      };
    } catch (error) {
      console.error('Error fetching today\'s automation status:', error);
      return { completed: false, stores_processed: 0, products_added: 0 };
    }
  }
}
