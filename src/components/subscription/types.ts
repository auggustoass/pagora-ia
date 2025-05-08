
export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  invoiceCredits?: number;
  creditConsumption?: number;
  reportsPerMonth?: number;
  forecastingAllowed?: boolean;
  financialAnalysisAllowed?: boolean;
}

export interface PlanColorScheme {
  gradientClass: string;
  badgeClass: string;
  hoverClass: string;
}

export interface FinancialReport {
  type: 'payment_status' | 'monthly' | 'quarterly' | 'yearly' | 'client_history' | 'delay_analysis' | 'dre' | 'forecast';
  title: string;
  data: any;
  generatedAt: Date;
  creditCost?: number;
}

export interface ReportPermissions {
  basic: string[];
  pro: string[];
  enterprise: string[];
}

export interface ReportCreditCost {
  payment_status: number;
  monthly: number;
  quarterly: number;
  yearly: number;
  client_history: number;
  delay_analysis: number;
  dre: number;
  forecast: number;
}
