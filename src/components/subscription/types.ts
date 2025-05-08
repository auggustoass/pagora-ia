
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
}

export interface ReportPermissions {
  basic: string[];
  pro: string[];
  enterprise: string[];
}
