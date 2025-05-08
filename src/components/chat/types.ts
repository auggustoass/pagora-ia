
export type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    reportType?: string;
    creditCost?: number;
  };
};

export type ConversationState = {
  mode: 'chat' | 'client_registration' | 'invoice_creation' | 'report_generation';
  step: string;
  data: Record<string, any>;
};

// Added for the Reports page
export interface ClientStatistics {
  totalClients: number;
  monthlyGrowth: { month: string; count: number }[];
  topClients: { id: string; nome: string; total: number }[];
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalValue: number;
  averageValue: number;
  statusCounts: Record<string, number>;
  avgPaymentDays: number;
  monthlyValues: { month: string; value: number }[];
  valueRanges: { range: string; count: number }[];
}
