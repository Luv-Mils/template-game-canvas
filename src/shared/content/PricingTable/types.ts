export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  price: { monthly: number | string; annual?: number | string };
  description?: string;
  features: PricingFeature[];
  cta: { label: string; href: string };
  highlighted?: boolean;
  badge?: string;
}

export interface PricingTableConfig {
  headline?: string;
  subheadline?: string;
  billingToggle?: boolean;
  tiers: PricingTier[];
  currency?: string;
}
