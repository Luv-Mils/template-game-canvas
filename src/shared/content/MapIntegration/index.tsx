/**
 * MapIntegration — Content Component (CTN-13)
 *
 * Google Maps embed, static address card, interactive map (via render prop),
 * contact card overlay, and "Get Directions" link.
 */

import React from 'react';
import { useTheme } from '../../foundation';
import type { MapIntegrationConfig, MapMarker, MapContactCard, MapAddress } from './types';

// -- Icons --------------------------------------------------------------------

function MapPinIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

// -- Address display ----------------------------------------------------------

function AddressBlock({ address }: { address: MapAddress }) {
  const parts = [address.street, address.city];
  if (address.state) parts.push(address.state);
  if (address.zip) parts[parts.length - 1] += ` ${address.zip}`;
  if (address.country) parts.push(address.country);
  return (
    <div className="text-sm text-foreground">
      {parts.map((part, i) => (
        <div key={i}>{part}</div>
      ))}
    </div>
  );
}

// -- Contact card -------------------------------------------------------------

function ContactCard({ card, address, center, showDirections }: {
  card: MapContactCard;
  address?: MapAddress;
  center: { lat: number; lng: number };
  showDirections?: boolean;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-lg p-4 space-y-3">
      <h4 className="text-base font-semibold text-foreground">{card.name}</h4>

      {address && (
        <div className="flex items-start gap-2 text-muted">
          <MapPinIcon />
          <AddressBlock address={address} />
        </div>
      )}

      {card.phone && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <PhoneIcon />
          <a href={`tel:${card.phone}`} className="hover:text-foreground transition-colors">{card.phone}</a>
        </div>
      )}

      {card.email && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <MailIcon />
          <a href={`mailto:${card.email}`} className="hover:text-foreground transition-colors">{card.email}</a>
        </div>
      )}

      {card.hours && card.hours.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ClockIcon />
            <span>Hours</span>
          </div>
          <div className="ml-6 space-y-0.5">
            {card.hours.map((h) => (
              <div key={h.day} className="flex justify-between text-xs text-muted">
                <span>{h.day}</span>
                <span>{h.open} – {h.close}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDirections && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Get Directions
          <ExternalLinkIcon />
        </a>
      )}
    </div>
  );
}

// -- Map embed ----------------------------------------------------------------

function MapEmbed({ center, zoom, height }: { center: { lat: number; lng: number }; zoom: number; height: string }) {
  const src = `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}&output=embed`;
  return (
    <iframe
      src={src}
      width="100%"
      height={height}
      style={{ border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer"
      className="rounded-xl"
      title="Map"
    />
  );
}

// -- Main Component -----------------------------------------------------------

export default function MapIntegration({ config }: { config: MapIntegrationConfig }) {
  useTheme();

  const zoom = config.zoom ?? 14;
  const height = config.height ?? '400px';
  const variant = config.variant;

  // Static variant: address card + directions only, no map
  if (variant === 'static') {
    return (
      <div className="space-y-4">
        {config.contactCard && (
          <ContactCard
            card={config.contactCard}
            address={config.address}
            center={config.center}
            showDirections={config.showDirectionsLink}
          />
        )}
        {!config.contactCard && config.address && (
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2 text-muted">
              <MapPinIcon />
              <AddressBlock address={config.address} />
            </div>
            {config.showDirectionsLink && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${config.center.lat},${config.center.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Get Directions <ExternalLinkIcon />
              </a>
            )}
          </div>
        )}
      </div>
    );
  }

  // Interactive variant: custom map element or fallback to embed
  if (variant === 'interactive' && config.mapElement) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl overflow-hidden border border-border" style={{ height }}>
          {config.mapElement({ center: config.center, markers: config.markers ?? [] })}
        </div>
        {config.contactCard && (
          <ContactCard
            card={config.contactCard}
            address={config.address}
            center={config.center}
            showDirections={config.showDirectionsLink}
          />
        )}
      </div>
    );
  }

  // Embed variant (default for both 'embed' and 'interactive' without mapElement)
  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden border border-border">
        <MapEmbed center={config.center} zoom={zoom} height={height} />
      </div>
      {config.contactCard && (
        <ContactCard
          card={config.contactCard}
          address={config.address}
          center={config.center}
          showDirections={config.showDirectionsLink}
        />
      )}
      {!config.contactCard && config.showDirectionsLink && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${config.center.lat},${config.center.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors"
        >
          Get Directions <ExternalLinkIcon />
        </a>
      )}
    </div>
  );
}

export type { MapIntegrationConfig, MapMarker, MapAddress, MapContactCard, ServiceArea } from './types';
