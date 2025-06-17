
import { useState, useEffect } from 'react';
import { StatusCount, ClientStatistics, InvoiceStatistics } from '@/types/reports';
import { ReportsService } from '@/services/ReportsService';
import { CustomDateRange } from '@/types/common';

interface UseReportsProps {
  dateRange?: CustomDateRange;
  userFilter?: string;
}

export const useReports = ({ dateRange, userFilter }: UseReportsProps = {}) => {
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [clientStats, setClientStats] = useState<ClientStatistics | null>(null);
  const [invoiceStats, setInvoiceStats] = useState<InvoiceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = dateRange?.from?.toISOString().split('T')[0];
      const endDate = dateRange?.to?.toISOString().split('T')[0];

      const [statusData, clientData, invoiceData] = await Promise.all([
        ReportsService.getInvoiceStatusCounts(startDate, endDate, userFilter),
        ReportsService.getClientStatistics(startDate, endDate, userFilter),
        ReportsService.getInvoiceStatistics(startDate, endDate, userFilter)
      ]);

      setStatusCounts(statusData);
      setClientStats(clientData);
      setInvoiceStats(invoiceData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, userFilter]);

  return {
    statusCounts,
    clientStats,
    invoiceStats,
    loading,
    error,
    refetch: fetchReports
  };
};
