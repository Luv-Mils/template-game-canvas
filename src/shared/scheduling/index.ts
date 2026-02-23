/**
 * Scheduling Components -- Barrel Export
 *
 * All shared scheduling components for Vibe Engine app templates.
 * Import from 'src/shared/scheduling' in any template.
 */

// SCH-01: BookingFlow
export { default as BookingFlow } from './BookingFlow';
export type { BookingFlowConfig, BookingService, BookingData } from './BookingFlow';

// SCH-02: AvailabilityPicker
export { default as AvailabilityPicker } from './AvailabilityPicker';
export type { AvailabilityPickerConfig, AvailabilitySlot } from './AvailabilityPicker';

// SCH-03: CalendarPicker
export { default as CalendarPicker } from './CalendarPicker';
export type { CalendarPickerConfig } from './CalendarPicker';

// SCH-04: EventSchedule
export { default as EventSchedule } from './EventSchedule';
export type { EventScheduleConfig, EventSession, EventSpeaker } from './EventSchedule';
