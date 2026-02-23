/**
 * Footer — Foundation Component (FND-04)
 *
 * Shared configurable footer for ALL templates.
 * - Brand column with icon + description
 * - Configurable link groups (columns)
 * - Copyright line + legal links
 * - Fully config-driven — no hardcoded text
 *
 * Uses Tailwind semantic classes only.
 */

import React from 'react';
import type { FooterConfig } from './types';

/** Default bolt icon used when no custom icon is provided */
function BoltIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

interface FooterProps {
  config: FooterConfig;
}

export default function Footer({ config }: FooterProps) {
  const year = new Date().getFullYear();
  const copyright = config.copyright ?? `\u00A9 ${year} ${config.brand.name}. All rights reserved.`;

  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main grid */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                {config.brand.icon ?? <BoltIcon />}
              </div>
              <span className="text-xl font-heading font-bold text-foreground">
                {config.brand.name}
              </span>
            </div>
            {config.brand.description && (
              <p className="text-muted leading-relaxed max-w-md">
                {config.brand.description}
              </p>
            )}
          </div>

          {/* Link groups */}
          {config.linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider mb-4">
                {group.title}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">{copyright}</p>
          {config.legalLinks && config.legalLinks.length > 0 && (
            <div className="flex items-center gap-6">
              {config.legalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export type { FooterConfig, FooterLink, FooterLinkGroup, FooterBrand } from './types';
