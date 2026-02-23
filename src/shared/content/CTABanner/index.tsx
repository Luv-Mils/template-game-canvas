/**
 * CTABanner -- Content Component (CTN-12)
 *
 * Full-width call-to-action banner with headline, description, and buttons.
 * Variants: simple (solid bg), gradient (primary-to-accent), image (background image).
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type { CTABannerConfig } from './types';

export default function CTABanner({ config }: { config: CTABannerConfig }) {
  useTheme();

  const variant = config.variant || 'simple';
  const align = config.alignment === 'left' ? 'text-left' : 'text-center';

  const bgClass =
    variant === 'gradient'
      ? 'bg-gradient-to-r from-primary to-accent'
      : variant === 'image'
        ? 'relative'
        : 'bg-surface';

  const textColor =
    variant === 'gradient' ? 'text-white' : 'text-foreground';

  const mutedColor =
    variant === 'gradient' ? 'text-white/80' : 'text-muted';

  return (
    <section className={`py-20 ${bgClass}`}>
      {variant === 'image' && config.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${config.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-background/70" />
        </>
      )}

      <div
        className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${align}`}
      >
        <h2
          className={`text-3xl sm:text-4xl font-heading font-bold ${textColor} mb-4`}
        >
          {config.headline}
        </h2>

        {config.description && (
          <p className={`text-lg ${mutedColor} max-w-2xl mb-8 ${
            config.alignment !== 'left' ? 'mx-auto' : ''
          }`}>
            {config.description}
          </p>
        )}

        <div
          className={`flex flex-wrap gap-4 ${
            config.alignment !== 'left' ? 'justify-center' : ''
          }`}
        >
          <a
            href={config.primaryCTA.href}
            className={`px-8 py-3 text-sm font-semibold rounded-lg transition-colors ${
              variant === 'gradient'
                ? 'bg-white text-primary hover:bg-white/90'
                : 'bg-primary text-white hover:bg-primary-hover'
            }`}
          >
            {config.primaryCTA.label}
          </a>
          {config.secondaryCTA && (
            <a
              href={config.secondaryCTA.href}
              className={`px-8 py-3 text-sm font-semibold rounded-lg border transition-colors ${
                variant === 'gradient'
                  ? 'border-white/50 text-white hover:bg-white/10'
                  : 'border-border text-foreground hover:bg-surface-alt'
              }`}
            >
              {config.secondaryCTA.label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export type { CTABannerConfig } from './types';
