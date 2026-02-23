/**
 * PricingTable -- Content Component (CTN-06)
 *
 * Tiered pricing with features list, highlighted "popular" tier,
 * and optional monthly/annual billing toggle.
 */

import React, { useState } from 'react';
import { useTheme } from '../../foundation';
import type { PricingTableConfig, PricingTier } from './types';

function CheckIcon({ included }: { included: boolean }) {
  return included ? (
    <svg
      className="w-5 h-5 text-primary flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  ) : (
    <svg
      className="w-5 h-5 text-border flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function TierCard({
  tier,
  currency,
  isAnnual,
}: {
  tier: PricingTier;
  currency: string;
  isAnnual: boolean;
}) {
  const price = isAnnual && tier.price.annual != null ? tier.price.annual : tier.price.monthly;
  const displayPrice = typeof price === 'number' ? `${currency}${price}` : price;

  return (
    <div
      className={`relative flex flex-col p-8 rounded-2xl border ${
        tier.highlighted
          ? 'border-primary ring-2 ring-primary bg-surface scale-105'
          : 'border-border bg-surface'
      }`}
    >
      {(tier.badge || tier.highlighted) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 text-xs font-semibold text-white bg-primary rounded-full">
            {tier.badge || 'Most Popular'}
          </span>
        </div>
      )}

      <h3 className="text-xl font-heading font-bold text-foreground mb-2">
        {tier.name}
      </h3>
      {tier.description && (
        <p className="text-sm text-muted mb-4">{tier.description}</p>
      )}

      <div className="mb-6">
        <span className="text-4xl font-heading font-bold text-foreground">
          {displayPrice}
        </span>
        {typeof price === 'number' && (
          <span className="text-muted text-sm ml-1">
            /{isAnnual ? 'year' : 'month'}
          </span>
        )}
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon included={feature.included} />
            <span
              className={`text-sm ${
                feature.included ? 'text-foreground' : 'text-muted line-through'
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={tier.cta.href}
        className={`block text-center py-3 px-6 rounded-lg font-semibold text-sm transition-colors ${
          tier.highlighted
            ? 'bg-primary text-white hover:bg-primary-hover'
            : 'bg-surface-alt text-foreground hover:bg-border border border-border'
        }`}
      >
        {tier.cta.label}
      </a>
    </div>
  );
}

export default function PricingTable({
  config,
}: {
  config: PricingTableConfig;
}) {
  useTheme();

  const [isAnnual, setIsAnnual] = useState(false);
  const currency = config.currency || '$';
  const hasAnnual = config.billingToggle && config.tiers.some((t) => t.price.annual != null);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(config.headline || config.subheadline) && (
          <div className="text-center mb-12">
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

        {hasAnnual && (
          <div className="flex items-center justify-center gap-3 mb-12">
            <span
              className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted'}`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted'}`}
            >
              Annual
            </span>
          </div>
        )}

        <div
          className={`grid gap-8 items-start ${
            config.tiers.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
              : config.tiers.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {config.tiers.map((tier, i) => (
            <TierCard key={i} tier={tier} currency={currency} isAnnual={isAnnual} />
          ))}
        </div>
      </div>
    </section>
  );
}

export type { PricingTableConfig, PricingTier, PricingFeature } from './types';
