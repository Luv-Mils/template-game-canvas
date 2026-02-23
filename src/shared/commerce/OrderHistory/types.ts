export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface OrderHistoryConfig {
  orders: Order[];
  currency?: string;
  onReorder?: (orderId: string) => void;
  onViewDetails?: (orderId: string) => void;
}
