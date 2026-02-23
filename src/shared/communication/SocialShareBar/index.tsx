/**
 * SocialShareBar -- Communication Component (CMM-07)
 *
 * Share buttons for Twitter/X, Facebook, LinkedIn, email, copy link.
 * Horizontal / vertical / floating variants. Inline SVG icons.
 */

import React, { useState, useCallback } from 'react';
import { useTheme } from '../../foundation';
import type { SocialShareBarConfig } from './types';

// -- SVG Icons ----------------------------------------------------------------

function TwitterIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l1.757-1.757a4.5 4.5 0 016.364 6.364l-4.5 4.5a4.5 4.5 0 01-7.244-1.242" />
    </svg>
  );
}

// -- Platform config ----------------------------------------------------------

interface PlatformConfig {
  icon: React.ReactNode;
  label: string;
  getUrl: (url: string, title: string, description?: string) => string | null;
  color: string;
}

const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    icon: <TwitterIcon />,
    label: 'Twitter',
    getUrl: (url, title) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    color: 'hover:text-[#1DA1F2]',
  },
  facebook: {
    icon: <FacebookIcon />,
    label: 'Facebook',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: 'hover:text-[#1877F2]',
  },
  linkedin: {
    icon: <LinkedInIcon />,
    label: 'LinkedIn',
    getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: 'hover:text-[#0A66C2]',
  },
  email: {
    icon: <EmailIcon />,
    label: 'Email',
    getUrl: (url, title, desc) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent((desc ? desc + '\n' : '') + url)}`,
    color: 'hover:text-primary',
  },
  copy: {
    icon: <CopyIcon />,
    label: 'Copy Link',
    getUrl: () => null, // handled separately
    color: 'hover:text-primary',
  },
};

// -- Main Component -----------------------------------------------------------

export default function SocialShareBar({ config }: { config: SocialShareBarConfig }) {
  useTheme();

  const [copied, setCopied] = useState(false);

  const handleShare = useCallback((platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(config.url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }

    const p = PLATFORMS[platform];
    if (!p) return;
    const shareUrl = p.getUrl(config.url, config.title, config.description);
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  }, [config]);

  const variant = config.variant ?? 'horizontal';
  const isFloating = variant === 'floating';
  const isVertical = variant === 'vertical' || isFloating;

  const containerClasses = isFloating
    ? 'fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2'
    : isVertical
      ? 'flex flex-col gap-2'
      : 'flex items-center gap-2';

  return (
    <div className={containerClasses}>
      {config.platforms.map((platform) => {
        const p = PLATFORMS[platform];
        if (!p) return null;

        return (
          <button
            key={platform}
            onClick={() => handleShare(platform)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface text-muted transition-colors ${p.color} hover:bg-surface-alt ${
              isFloating ? 'shadow-md' : ''
            }`}
            title={p.label}
          >
            {platform === 'copy' && copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              p.icon
            )}
            {config.showLabels && (
              <span className="text-sm">
                {platform === 'copy' && copied ? 'Copied!' : p.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export type { SocialShareBarConfig } from './types';
