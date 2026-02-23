export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

export interface NavbarBrand {
  /** Display name next to the logo */
  name: string;
  /** Optional SVG icon as JSX or null for default bolt icon */
  icon?: React.ReactNode;
  /** Link target for the brand (default: "/") */
  href?: string;
}

export interface NavbarCta {
  label: string;
  href: string;
}

/** Section group for sidebar navigation */
export interface NavSection {
  title?: string;
  links: Array<{ label: string; href: string; icon?: string; badge?: string | number }>;
}

/** Tab item for bottom-tab variant */
export interface NavTab {
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
}

/** Breadcrumb item */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavbarConfig {
  /** Brand/logo section */
  brand: NavbarBrand;
  /** Navigation links — auto-generated from layout if not provided */
  links?: NavLink[];
  /** Call-to-action button (right side). Omit to hide. */
  cta?: NavbarCta;

  /** Navigation variant — default 'topbar' preserves existing behavior */
  variant?: 'topbar' | 'sidebar' | 'bottom-tab';

  /** Sidebar-specific: allow collapsing to icon-only rail */
  sidebarCollapsible?: boolean;
  /** Sidebar-specific: start in collapsed state */
  sidebarDefaultCollapsed?: boolean;
  /** Sidebar-specific: panel width (default '256px') */
  sidebarWidth?: string;
  /** Sidebar-specific: custom header above nav items */
  sidebarHeader?: React.ReactNode;
  /** Sidebar-specific: custom footer below nav items */
  sidebarFooter?: React.ReactNode;
  /** Sidebar-specific: grouped navigation sections */
  sections?: NavSection[];

  /** Bottom-tab-specific: tab items with required icons */
  tabs?: NavTab[];

  /** Breadcrumbs (works with any variant) */
  breadcrumbs?: BreadcrumbItem[];
  /** Show breadcrumbs (default false) */
  showBreadcrumbs?: boolean;
}

export interface LayoutDef {
  type: 'singlePage' | 'multiPage';
  pages?: { path: string; name: string; sections: string[] }[];
  sections?: string[];
}
