
import { supabase } from '@/integrations/supabase/client';
import { StatusCount, ClientStatistics, InvoiceStatistics } from '@/types/reports';

export class ReportsService {
  static async getInvoiceStatusCounts(
    startDate?: string,
    endDate?: string,
    userFilter?: string
  ): Promise<StatusCount[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get_invoice_status_counts', {
        body: {
          start_date: startDate,
          end_date: endDate,
          user_filter: userFilter
        }
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching invoice status counts:', error);
      return [];
    }
  }

  static async getClientStatistics(
    startDate?: string,
    endDate?: string,
    userFilter?: string
  ): Promise<ClientStatistics | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get_client_statistics', {
        body: {
          start_date: startDate,
          end_date: endDate,
          user_filter: userFilter
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching client statistics:', error);
      return null;
    }
  }

  static async getInvoiceStatistics(
    startDate?: string,
    endDate?: string,
    userFilter?: string
  ): Promise<InvoiceStatistics | null> {
    try {
      const { data, error } = await supabase.functions.invoke('get_invoice_statistics', {
        body: {
          start_date: startDate,
          end_date: endDate,
          user_filter: userFilter
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice statistics:', error);
      return null;
    }
  }
}
