export interface EventSpeaker {
  name: string;
  title?: string;
  avatar?: string;
}

export interface EventSession {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speaker?: EventSpeaker;
  track?: string;
  tags?: string[];
  location?: string;
}

export interface EventScheduleConfig {
  sessions: EventSession[];
  date?: string;
  tracks?: string[];
  variant?: 'agenda' | 'timeline' | 'grid';
  onSessionClick?: (session: EventSession) => void;
}
