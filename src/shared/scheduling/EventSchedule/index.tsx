/**
 * EventSchedule -- Scheduling Component (SCH-04)
 *
 * Agenda / timeline / grid view of event sessions with times, speakers, tracks.
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type { EventScheduleConfig, EventSession } from './types';

// -- Helpers ------------------------------------------------------------------

function formatTime(t: string): string {
  if (t.includes('T')) {
    const d = new Date(t);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  }
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function getTimeMinutes(t: string): number {
  if (t.includes('T')) {
    const d = new Date(t);
    return d.getHours() * 60 + d.getMinutes();
  }
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

// -- Session Card -------------------------------------------------------------

function SessionCard({
  session,
  onClick,
  compact,
}: {
  session: EventSession;
  onClick?: (s: EventSession) => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={() => onClick?.(session)}
      className={`text-left w-full bg-surface border border-border rounded-lg transition-colors hover:border-primary/40 ${
        compact ? 'p-3' : 'p-4'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        {session.speaker?.avatar && (
          <img
            src={session.speaker.avatar}
            alt={session.speaker.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            {session.title}
          </div>
          {!compact && session.description && (
            <div className="text-xs text-muted mt-0.5 line-clamp-2">{session.description}</div>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            {session.speaker && (
              <span className="text-xs text-muted">
                {session.speaker.name}
                {session.speaker.title && ` · ${session.speaker.title}`}
              </span>
            )}
            {session.location && (
              <span className="text-xs text-muted">📍 {session.location}</span>
            )}
          </div>
          {session.tags && session.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {session.tags.map((tag, i) => (
                <span key={i} className="px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// -- Agenda View --------------------------------------------------------------

function AgendaView({
  sessions,
  onClick,
}: {
  sessions: EventSession[];
  onClick?: (s: EventSession) => void;
}) {
  // Group by start time
  const groups: Record<string, EventSession[]> = {};
  sessions.forEach((s) => {
    const key = formatTime(s.startTime);
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    const sa = sessions.find((s) => formatTime(s.startTime) === a);
    const sb = sessions.find((s) => formatTime(s.startTime) === b);
    return getTimeMinutes(sa?.startTime ?? '0:00') - getTimeMinutes(sb?.startTime ?? '0:00');
  });

  return (
    <div className="space-y-6">
      {sortedKeys.map((time) => (
        <div key={time} className="flex gap-4">
          <div className="w-20 flex-shrink-0 text-right">
            <span className="text-sm font-semibold text-foreground">{time}</span>
          </div>
          <div className="flex-1 space-y-2">
            {groups[time].map((session) => (
              <SessionCard key={session.id} session={session} onClick={onClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Timeline View ------------------------------------------------------------

function TimelineView({
  sessions,
  onClick,
}: {
  sessions: EventSession[];
  onClick?: (s: EventSession) => void;
}) {
  const sorted = [...sessions].sort(
    (a, b) => getTimeMinutes(a.startTime) - getTimeMinutes(b.startTime),
  );

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-6">
        {sorted.map((session) => (
          <div key={session.id} className="relative">
            {/* Dot */}
            <div className="absolute -left-5 top-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
            {/* Time label */}
            <div className="text-xs text-muted mb-1">
              {formatTime(session.startTime)} – {formatTime(session.endTime)}
            </div>
            <SessionCard session={session} onClick={onClick} />
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Grid View (Multi-track) --------------------------------------------------

function GridView({
  sessions,
  tracks,
  onClick,
}: {
  sessions: EventSession[];
  tracks: string[];
  onClick?: (s: EventSession) => void;
}) {
  // Get unique time slots
  const times = [...new Set(sessions.map((s) => s.startTime))].sort(
    (a, b) => getTimeMinutes(a) - getTimeMinutes(b),
  );

  return (
    <div className="overflow-auto">
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `80px repeat(${tracks.length}, minmax(200px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div />
        {tracks.map((track) => (
          <div key={track} className="px-3 py-2 text-xs font-semibold text-muted uppercase tracking-wider text-center bg-surface rounded-lg">
            {track}
          </div>
        ))}

        {/* Time rows */}
        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="text-xs text-muted text-right pr-2 pt-3">
              {formatTime(time)}
            </div>
            {tracks.map((track) => {
              const session = sessions.find(
                (s) => s.startTime === time && s.track === track,
              );
              return (
                <div key={track} className="min-h-[60px]">
                  {session ? (
                    <SessionCard session={session} onClick={onClick} compact />
                  ) : (
                    <div className="h-full border border-dashed border-border/50 rounded-lg" />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// -- Main Component -----------------------------------------------------------

export default function EventSchedule({ config }: { config: EventScheduleConfig }) {
  useTheme();

  const variant = config.variant ?? 'agenda';
  const tracks = config.tracks ?? [...new Set(config.sessions.map((s) => s.track).filter(Boolean) as string[])];

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      {/* Header */}
      {config.date && (
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            {new Date(config.date).toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
        </div>
      )}

      <div className="p-6">
        {variant === 'agenda' && (
          <AgendaView sessions={config.sessions} onClick={config.onSessionClick} />
        )}
        {variant === 'timeline' && (
          <TimelineView sessions={config.sessions} onClick={config.onSessionClick} />
        )}
        {variant === 'grid' && tracks.length > 0 && (
          <GridView sessions={config.sessions} tracks={tracks} onClick={config.onSessionClick} />
        )}
      </div>
    </div>
  );
}

export type { EventScheduleConfig, EventSession, EventSpeaker } from './types';
