export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  description?: string;
  icon?: string;
}

export interface ServiceArea {
  type: 'radius' | 'polygon';
  radius?: number;
  points?: Array<{ lat: number; lng: number }>;
  color?: string;
  opacity?: number;
}

export interface MapAddress {
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface MapContactCard {
  name: string;
  phone?: string;
  email?: string;
  hours?: Array<{ day: string; open: string; close: string }>;
}

export interface MapIntegrationConfig {
  variant: 'embed' | 'static' | 'interactive';
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  serviceArea?: ServiceArea;
  address?: MapAddress;
  showDirectionsLink?: boolean;
  height?: string;
  contactCard?: MapContactCard;
  mapElement?: (config: { center: { lat: number; lng: number }; markers: MapMarker[] }) => React.ReactNode;
}
