/**
 * Commerce & Payments Components -- Barrel Export
 *
 * All shared commerce components for Vibe Engine app templates.
 * Import from 'src/shared/commerce' in any template.
 */

// COM-01: ProductCatalog
export { default as ProductCatalog } from './ProductCatalog';
export type { ProductCatalogConfig, Product } from './ProductCatalog';

// COM-02: ShoppingCart
export { default as ShoppingCart } from './ShoppingCart';
export type { ShoppingCartConfig, CartItem, PromoCode } from './ShoppingCart';

// COM-03: CheckoutFlow
export { default as CheckoutFlow } from './CheckoutFlow';
export type { CheckoutFlowConfig, OrderData, ShippingOption } from './CheckoutFlow';

// COM-04: InvoiceGenerator
export { default as InvoiceGenerator } from './InvoiceGenerator';
export type { InvoiceGeneratorConfig, Invoice, InvoiceItem, InvoiceParty } from './InvoiceGenerator';

// COM-05: OrderHistory
export { default as OrderHistory } from './OrderHistory';
export type { OrderHistoryConfig, Order, OrderItem } from './OrderHistory';

// COM-06: DonationWidget
export { default as DonationWidget } from './DonationWidget';
export type { DonationWidgetConfig } from './DonationWidget';

// COM-07: PaymentTracker
export { default as PaymentTracker } from './PaymentTracker';
export type { PaymentTrackerConfig, PaymentTransaction, PaymentSummary } from './PaymentTracker';
