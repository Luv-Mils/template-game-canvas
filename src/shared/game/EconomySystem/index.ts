/**
 * EconomySystem — Game Engine Component (GME-16)
 *
 * Multi-currency management, shop with unlock conditions,
 * buy/sell transactions, prestige/reset with multiplier.
 */

import type { EconomyConfig, ShopItem } from './types';

export class EconomySystem {
  private balances: Map<string, number> = new Map();
  private purchases: Map<string, number> = new Map();
  private prestigeCount = 0;
  private multiplier = 1;
  private config: EconomyConfig;

  constructor(config: EconomyConfig) {
    this.config = config;
    for (const currency of config.currencies) {
      this.balances.set(currency.id, currency.startingAmount ?? 0);
    }
  }

  // -- Currency management ----------------------------------------------------

  getBalance(currencyId: string): number {
    return this.balances.get(currencyId) ?? 0;
  }

  addCurrency(currencyId: string, amount: number): void {
    const current = this.balances.get(currencyId) ?? 0;
    const gained = amount * this.multiplier;
    const currDef = this.config.currencies.find((c) => c.id === currencyId);
    const max = currDef?.maxAmount;
    const newBalance = max !== undefined ? Math.min(current + gained, max) : current + gained;
    this.balances.set(currencyId, newBalance);
  }

  spendCurrency(currencyId: string, amount: number): boolean {
    const current = this.balances.get(currencyId) ?? 0;
    if (current < amount) return false;
    this.balances.set(currencyId, current - amount);
    return true;
  }

  canAfford(costs: Array<{ currencyId: string; amount: number }>): boolean {
    for (const cost of costs) {
      if ((this.balances.get(cost.currencyId) ?? 0) < cost.amount) return false;
    }
    return true;
  }

  getAllBalances(): Record<string, number> {
    return Object.fromEntries(this.balances);
  }

  // -- Shop -------------------------------------------------------------------

  buyItem(itemId: string): { success: boolean; reason?: string } {
    if (!this.config.shop) return { success: false, reason: 'No shop configured' };

    const item = this.config.shop.items.find((i) => i.id === itemId);
    if (!item) return { success: false, reason: 'Item not found' };

    // Check unlock condition
    if (item.unlockCondition) {
      try {
        if (!item.unlockCondition(this)) return { success: false, reason: 'Item locked' };
      } catch {
        return { success: false, reason: 'Unlock check failed' };
      }
    }

    // Check max purchases
    if (item.maxPurchases !== undefined) {
      const count = this.purchases.get(itemId) ?? 0;
      if (count >= item.maxPurchases) return { success: false, reason: 'Max purchases reached' };
    }

    // Check affordability
    if (!this.canAfford(item.cost)) return { success: false, reason: 'Not enough currency' };

    // Deduct costs
    for (const cost of item.cost) {
      this.spendCurrency(cost.currencyId, cost.amount);
    }

    // Record purchase
    this.purchases.set(itemId, (this.purchases.get(itemId) ?? 0) + 1);

    return { success: true };
  }

  getShopItems(): Array<ShopItem & { affordable: boolean; unlocked: boolean; purchaseCount: number }> {
    if (!this.config.shop) return [];

    return this.config.shop.items.map((item) => {
      let unlocked = true;
      if (item.unlockCondition) {
        try {
          unlocked = item.unlockCondition(this);
        } catch {
          unlocked = false;
        }
      }

      return {
        ...item,
        affordable: this.canAfford(item.cost),
        unlocked,
        purchaseCount: this.purchases.get(item.id) ?? 0,
      };
    });
  }

  getPurchaseCount(itemId: string): number {
    return this.purchases.get(itemId) ?? 0;
  }

  // -- Prestige ---------------------------------------------------------------

  prestige(): void {
    if (!this.config.prestige) return;

    const { resetCurrencies, keepCurrencies, bonusMultiplier } = this.config.prestige;

    // Reset specified currencies
    for (const id of resetCurrencies) {
      const currDef = this.config.currencies.find((c) => c.id === id);
      this.balances.set(id, currDef?.startingAmount ?? 0);
    }

    // Keep currencies not in reset list (keepCurrencies is informational)
    // Currencies not in resetCurrencies are implicitly kept

    // Reset purchases
    this.purchases.clear();

    // Increment prestige and multiplier
    this.prestigeCount++;
    this.multiplier *= (bonusMultiplier ?? 1.5);
  }

  getPrestigeCount(): number {
    return this.prestigeCount;
  }

  getMultiplier(): number {
    return this.multiplier;
  }

  // -- Serialization ----------------------------------------------------------

  save(): string {
    return JSON.stringify({
      balances: Object.fromEntries(this.balances),
      purchases: Object.fromEntries(this.purchases),
      prestigeCount: this.prestigeCount,
      multiplier: this.multiplier,
    });
  }

  load(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.balances && typeof data.balances === 'object') {
        this.balances = new Map(Object.entries(data.balances).map(([k, v]) => [k, v as number]));
      }
      if (data.purchases && typeof data.purchases === 'object') {
        this.purchases = new Map(Object.entries(data.purchases).map(([k, v]) => [k, v as number]));
      }
      if (typeof data.prestigeCount === 'number') this.prestigeCount = data.prestigeCount;
      if (typeof data.multiplier === 'number') this.multiplier = data.multiplier;
    } catch {
      // corrupted data
    }
  }

  reset(): void {
    for (const currency of this.config.currencies) {
      this.balances.set(currency.id, currency.startingAmount ?? 0);
    }
    this.purchases.clear();
    this.prestigeCount = 0;
    this.multiplier = 1;
  }
}

export type { EconomyConfig, CurrencyDef, ShopItem, PrestigeConfig } from './types';
