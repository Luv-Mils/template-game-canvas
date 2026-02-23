export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  allDay?: boolean;
  description?: string;
  category?: string;
}

export interface CalendarViewConfig {
  view: 'month' | 'week' | 'day';
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  onEventDrop?: (eventId: string, newStart: string, newEnd: string) => void;
  firstDayOfWeek?: 0 | 1;
  showWeekNumbers?: boolean;
}
