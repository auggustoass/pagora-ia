
export interface StatusCount {
  status: string;
  count: number;
}

export interface ClientStatistics {
  totalClients: number;
  monthlyGrowth: Array<{ month: string; count: number }>;
  topClients: Array<{ id: string; nome: string; total: number }>;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalValue: number;
  averageValue?: number;
  statusCounts?: Record<string, number>;
  avgPaymentDays: number;
  monthlyValues: Array<{ month: string; value: number }>;
  valueRanges: Array<{ range: string; count: number }>;
}
