export interface GlobalSettings {
  company_name: string;
  company_logo: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  tagline: string | null;
  address: string | null;
  tax_registration_number: string | null;
  currency_default: string;
  paper_size: string;
  return_policy: string | null;
  terms: string | null;
  footer_message: string | null;
}
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
}
export type SettingsScope = "global" | "branch";
