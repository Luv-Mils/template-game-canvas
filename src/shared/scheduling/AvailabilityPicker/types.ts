export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export interface AvailabilityPickerConfig {
  date: string;
  slots: AvailabilitySlot[];
  duration?: number;
  onSlotSelect: (time: string) => void;
  timezone?: string;
  interval?: number;
}
