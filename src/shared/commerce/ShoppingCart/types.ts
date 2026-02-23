export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
}

export interface ShoppingCartConfig {
  items: CartItem[];
  currency?: string;
  taxRate?: number;
  promoCode?: PromoCode;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  onPromoApply?: (code: string) => void;
  onCheckout?: () => void;
  variant?: 'page' | 'slideout';
}
