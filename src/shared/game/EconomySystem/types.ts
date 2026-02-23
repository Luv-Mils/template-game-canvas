export interface CurrencyDef {
  id: string;
  name: string;
  icon?: string;
  startingAmount?: number;
  maxAmount?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  cost: Array<{ currencyId: string; amount: number }>;
  category?: string;
  maxPurchases?: number;
  unlockCondition?: (economy: import('./index').EconomySystem) => boolean;
  effects?: Record<string, unknown>;
}

export interface PrestigeConfig {
  resetCurrencies: string[];
  keepCurrencies: string[];
  bonusMultiplier?: number;
}

export interface EconomyConfig {
  currencies: CurrencyDef[];
  shop?: { items: ShopItem[] };
  prestige?: PrestigeConfig;
}
