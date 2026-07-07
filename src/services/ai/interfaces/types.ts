export interface AIQuery {
  prompt: string;
  context?: string;
  sessionId?: string;
}
export interface AIResponse {
  answer: string;
  confidence: number;
  suggestedActions?: Array<{label: string; type: string; payload: Record<string, any>}>;
}
export interface AIInsight {
  type: 'revenue_trend' | 'stock_alert' | 'customer_churn';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}