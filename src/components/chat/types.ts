
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
