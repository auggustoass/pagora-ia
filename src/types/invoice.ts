
export interface Invoice {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  valor: number;
  vencimento: string;
  descricao: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  user_id: string;
  payment_url: string | null;
  payment_status: string | null;
  mercado_pago_preference_id: string | null;
  client_id?: string;
  cpf_cnpj: string;
  created_at: string;
  payment_date?: string;
  paid_amount?: number;
}

export interface InvoiceFormData {
  clientId: string;
  valor: string;
  vencimento: Date;
  descricao: string;
  generatePaymentLink?: boolean;
}

export interface InvoiceFilters {
  status?: 'all' | 'pendente' | 'aprovado' | 'rejeitado';
  searchTerm?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface InvoiceStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  totalValue: number;
  averageValue: number;
}
