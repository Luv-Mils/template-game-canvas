import type { CartItem } from '../ShoppingCart/types';

export interface ShippingOption {
  id: string;
  label: string;
  price: number;
  estimate: string;
}

export interface OrderData {
  info: { name: string; email: string; phone?: string; address: string; city: string; zip: string };
  shipping?: ShippingOption;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
}

export interface CheckoutFlowConfig {
  steps: Array<'info' | 'shipping' | 'payment' | 'review'>;
  cart: CartItem[];
  currency?: string;
  taxRate?: number;
  shippingOptions?: ShippingOption[];
  onComplete?: (order: OrderData) => void;
  paymentElement?: React.ReactNode;
}
