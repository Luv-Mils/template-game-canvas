export interface CalendarPickerConfig {
  mode: 'single' | 'range';
  selected?: string | { start: string; end: string };
  onSelect: (date: string | { start: string; end: string }) => void;
  minDate?: string;
  maxDate?: string;
  disabledDates?: string[];
  disabledDays?: number[];
  highlightedDates?: Array<{ date: string; color?: string; label?: string }>;
  firstDayOfWeek?: 0 | 1;
}
