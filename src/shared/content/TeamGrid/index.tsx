/**
 * TeamGrid -- Content Component (CTN-10)
 *
 * Team member cards with photo, name, title, bio, and social links.
 * Variants: card (bg-surface cards), minimal (no card bg), overlay (name on hover over photo).
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type { TeamGridConfig, TeamMember } from './types';

const COL_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function SocialIcon({ platform }: { platform: string }) {
  // Return first letter as a simple fallback
  return (
    <span className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-muted text-xs font-bold uppercase hover:bg-primary hover:text-white transition-colors">
      {platform.charAt(0)}
    </span>
  );
}

function Socials({ socials }: { socials: TeamMember['socials'] }) {
  if (!socials || socials.length === 0) return null;
  return (
    <div className="flex gap-2">
      {socials.map((s, i) => (
        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">
          <SocialIcon platform={s.platform} />
        </a>
      ))}
    </div>
  );
}

function Avatar({
  member,
  size,
}: {
  member: TeamMember;
  size: 'sm' | 'lg';
}) {
  const sizeClass = size === 'lg' ? 'w-32 h-32' : 'w-20 h-20';
  const textSize = size === 'lg' ? 'text-3xl' : 'text-xl';

  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={member.name}
        className={`${sizeClass} rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold ${textSize}`}
    >
      {member.name.charAt(0)}
    </div>
  );
}

function CardMember({ member }: { member: TeamMember }) {
  return (
    <div className="p-6 bg-surface rounded-xl border border-border text-center hover:border-primary/50 hover:shadow-lg transition-all">
      <div className="flex justify-center mb-4">
        <Avatar member={member} size="lg" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground">
        {member.name}
      </h3>
      <p className="text-sm text-primary mb-2">{member.title}</p>
      {member.bio && (
        <p className="text-sm text-muted leading-relaxed mb-4">{member.bio}</p>
      )}
      <div className="flex justify-center">
        <Socials socials={member.socials} />
      </div>
    </div>
  );
}

function MinimalMember({ member }: { member: TeamMember }) {
  return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-4">
        <Avatar member={member} size="lg" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground">
        {member.name}
      </h3>
      <p className="text-sm text-primary mb-2">{member.title}</p>
      {member.bio && (
        <p className="text-sm text-muted leading-relaxed mb-4">{member.bio}</p>
      )}
      <div className="flex justify-center">
        <Socials socials={member.socials} />
      </div>
    </div>
  );
}

function OverlayMember({ member }: { member: TeamMember }) {
  return (
    <div className="relative group rounded-xl overflow-hidden aspect-[3/4] bg-surface-alt">
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-primary/30">
          {member.name.charAt(0)}
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/0 to-transparent flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-lg font-heading font-semibold text-foreground">
          {member.name}
        </h3>
        <p className="text-sm text-primary mb-2">{member.title}</p>
        {member.bio && (
          <p className="text-xs text-muted line-clamp-2 mb-2">{member.bio}</p>
        )}
        <Socials socials={member.socials} />
      </div>
    </div>
  );
}

export default function TeamGrid({ config }: { config: TeamGridConfig }) {
  useTheme();

  const cols = config.columns || 3;
  const variant = config.variant || 'card';

  const MemberComponent =
    variant === 'minimal'
      ? MinimalMember
      : variant === 'overlay'
        ? OverlayMember
        : CardMember;

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(config.headline || config.subheadline) && (
          <div className="text-center mb-16">
            {config.headline && (
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                {config.headline}
              </h2>
            )}
            {config.subheadline && (
              <p className="text-lg text-muted max-w-2xl mx-auto">
                {config.subheadline}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${COL_CLASSES[cols] || COL_CLASSES[3]} gap-8`}>
          {config.members.map((member, i) => (
            <MemberComponent key={i} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}

export type { TeamGridConfig, TeamMember, TeamSocial } from './types';
