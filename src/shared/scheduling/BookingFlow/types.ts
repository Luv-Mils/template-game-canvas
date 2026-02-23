import type { AvailabilitySlot } from '../AvailabilityPicker/types';

export interface BookingService {
  id: string;
  name: string;
  duration: number;
  price?: number;
  description?: string;
  category?: string;
}

export interface BookingData {
  service: BookingService;
  date: string;
  time: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
}

export interface BookingFlowConfig {
  steps: Array<'service' | 'datetime' | 'info' | 'confirm'>;
  services: BookingService[];
  availability: Record<string, AvailabilitySlot[]>;
  onComplete: (booking: BookingData) => void;
  currency?: string;
  requirePayment?: boolean;
  paymentElement?: React.ReactNode;
}
