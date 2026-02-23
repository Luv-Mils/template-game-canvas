/**
 * HeroSection -- Content Component (CTN-01)
 *
 * Full-width hero with 5 layout variants, all config-driven.
 * Variants: centered, split, minimal, video, gradient.
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type { HeroConfig } from './types';

function Badges({ badges }: { badges: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => (
        <span
          key={i}
          className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

function CTAButtons({
  primary,
  secondary,
}: {
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {primary && (
        <a
          href={primary.href}
          className="px-8 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
        >
          {primary.label}
        </a>
      )}
      {secondary && (
        <a
          href={secondary.href}
          className="px-8 py-3 text-sm font-semibold text-foreground bg-surface hover:bg-surface-alt border border-border rounded-lg transition-colors"
        >
          {secondary.label}
        </a>
      )}
    </div>
  );
}

function CenteredHero({ config }: { config: HeroConfig }) {
  const align =
    config.alignment === 'left'
      ? 'text-left items-start'
      : config.alignment === 'right'
        ? 'text-right items-end'
        : 'text-center items-center';

  return (
    <div
      className={`relative ${config.minHeight || 'min-h-[80vh]'} flex items-center justify-center`}
    >
      {config.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.backgroundImage})` }}
        >
          {config.backgroundOverlay && (
            <div className="absolute inset-0 bg-background/70" />
          )}
        </div>
      )}
      <div
        className={`relative z-10 max-w-4xl mx-auto px-4 flex flex-col gap-6 ${align}`}
      >
        {config.badges && <Badges badges={config.badges} />}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
          {config.headline}
        </h1>
        {config.subheadline && (
          <p className="text-lg sm:text-xl text-muted max-w-2xl">
            {config.subheadline}
          </p>
        )}
        <CTAButtons primary={config.primaryCTA} secondary={config.secondaryCTA} />
      </div>
    </div>
  );
}

function SplitHero({ config }: { config: HeroConfig }) {
  return (
    <div className={`${config.minHeight || 'min-h-[80vh]'} flex items-center`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          {config.badges && <Badges badges={config.badges} />}
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-foreground leading-tight">
            {config.headline}
          </h1>
          {config.subheadline && (
            <p className="text-lg text-muted">{config.subheadline}</p>
          )}
          <CTAButtons primary={config.primaryCTA} secondary={config.secondaryCTA} />
        </div>
        {config.media && (
          <div className="relative rounded-2xl overflow-hidden bg-surface-alt aspect-video">
            {config.media.type === 'image' ? (
              <img
                src={config.media.src}
                alt={config.media.alt || ''}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={config.media.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MinimalHero({ config }: { config: HeroConfig }) {
  return (
    <div
      className={`${config.minHeight || 'min-h-[60vh]'} flex items-center justify-center`}
    >
      <div className="max-w-3xl mx-auto px-4 text-center flex flex-col gap-8 items-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-tight">
          {config.headline}
        </h1>
        {config.subheadline && (
          <p className="text-lg text-muted">{config.subheadline}</p>
        )}
        <CTAButtons primary={config.primaryCTA} secondary={config.secondaryCTA} />
      </div>
    </div>
  );
}

function VideoHero({ config }: { config: HeroConfig }) {
  return (
    <div
      className={`relative ${config.minHeight || 'min-h-screen'} flex items-center justify-center overflow-hidden`}
    >
      {config.backgroundVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={config.backgroundVideo} />
        </video>
      )}
      {config.backgroundOverlay !== false && (
        <div className="absolute inset-0 bg-background/60" />
      )}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center flex flex-col gap-6 items-center">
        {config.badges && <Badges badges={config.badges} />}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
          {config.headline}
        </h1>
        {config.subheadline && (
          <p className="text-lg sm:text-xl text-muted max-w-2xl">
            {config.subheadline}
          </p>
        )}
        <CTAButtons primary={config.primaryCTA} secondary={config.secondaryCTA} />
      </div>
    </div>
  );
}

function GradientHero({ config }: { config: HeroConfig }) {
  const align =
    config.alignment === 'left'
      ? 'text-left items-start'
      : config.alignment === 'right'
        ? 'text-right items-end'
        : 'text-center items-center';

  return (
    <div
      className={`${config.minHeight || 'min-h-[80vh]'} flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20`}
    >
      <div className={`max-w-4xl mx-auto px-4 flex flex-col gap-6 ${align}`}>
        {config.badges && <Badges badges={config.badges} />}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight">
          {config.headline}
        </h1>
        {config.subheadline && (
          <p className="text-lg sm:text-xl text-muted max-w-2xl">
            {config.subheadline}
          </p>
        )}
        <CTAButtons primary={config.primaryCTA} secondary={config.secondaryCTA} />
      </div>
    </div>
  );
}

export default function HeroSection({ config }: { config: HeroConfig }) {
  useTheme();

  switch (config.variant) {
    case 'split':
      return <SplitHero config={config} />;
    case 'minimal':
      return <MinimalHero config={config} />;
    case 'video':
      return <VideoHero config={config} />;
    case 'gradient':
      return <GradientHero config={config} />;
    case 'centered':
    default:
      return <CenteredHero config={config} />;
  }
}

export type { HeroConfig, HeroCTA, HeroMedia } from './types';
