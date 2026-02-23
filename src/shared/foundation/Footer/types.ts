export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface FooterBrand {
  /** Display name */
  name: string;
  /** Optional icon as JSX */
  icon?: React.ReactNode;
  /** Short description below the brand */
  description?: string;
}

export interface FooterConfig {
  /** Brand section (left column) */
  brand: FooterBrand;
  /** Grouped link columns */
  linkGroups: FooterLinkGroup[];
  /** Copyright line — defaults to "YYYY {brand.name}. All rights reserved." */
  copyright?: string;
  /** Bottom legal links (Privacy, Terms, etc.) */
  legalLinks?: FooterLink[];
}
