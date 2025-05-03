
export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  invoiceCredits?: number;
}

export interface PlanColorScheme {
  gradientClass: string;
  badgeClass: string;
  hoverClass: string;
}
