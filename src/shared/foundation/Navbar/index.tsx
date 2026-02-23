/**
 * Navbar — Foundation Component (FND-02)
 *
 * Multi-variant navigation system:
 * - topbar (default): Sticky top with backdrop blur, desktop links + CTA, mobile hamburger
 * - sidebar: Fixed left panel with section grouping, collapsible to icon rail, mobile overlay
 * - bottom-tab: Fixed bottom bar with icon tabs, badge support
 *
 * Breadcrumbs work with any variant.
 * SidebarLayout is a named export for sidebar variant page wrappers.
 */

import React, { useState } from 'react';
import type { NavbarConfig, NavLink, LayoutDef, BreadcrumbItem } from './types';

// -- Icons --------------------------------------------------------------------

function BoltIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-3 h-3 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

// -- Helpers ------------------------------------------------------------------

function linksFromLayout(layout: LayoutDef): NavLink[] {
  if (layout.type === 'multiPage' && layout.pages) {
    return layout.pages.map((p) => ({ label: p.name, href: p.path }));
  }
  if (layout.sections) {
    return layout.sections.map((id) => ({
      label: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      href: `#${id}`,
    }));
  }
  return [];
}

function Badge({ value }: { value: string | number }) {
  return (
    <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-primary/10 text-primary rounded-full">
      {value}
    </span>
  );
}

// -- Breadcrumbs --------------------------------------------------------------

function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="flex items-center gap-1.5 px-4 sm:px-6 lg:px-8 py-2 text-xs" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight />}
            {isLast || !item.href ? (
              <span className={isLast ? 'font-semibold text-foreground' : 'text-muted'}>{item.label}</span>
            ) : (
              <a href={item.href} className="text-muted hover:text-foreground transition-colors">
                {item.label}
              </a>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// -- Topbar (existing behavior, unchanged) ------------------------------------

function TopbarNav({ config, links }: { config: NavbarConfig; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const brandHref = config.brand.href ?? '/';

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href={brandHref} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            {config.brand.icon ?? <BoltIcon />}
          </div>
          <span className="text-xl font-heading font-bold text-foreground">
            {config.brand.name}
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          {config.cta && (
            <a href={config.cta.href} className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors">
              {config.cta.label}
            </a>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface border-b border-border px-4 pb-4 space-y-2">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-muted hover:text-foreground">
              {l.label}
            </a>
          ))}
          {config.cta && (
            <a href={config.cta.href} onClick={() => setOpen(false)} className="block py-2 text-sm font-semibold text-primary">
              {config.cta.label}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}

// -- Sidebar ------------------------------------------------------------------

function SidebarNav({ config }: { config: NavbarConfig }) {
  const [collapsed, setCollapsed] = useState(config.sidebarDefaultCollapsed ?? false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const width = config.sidebarWidth ?? '256px';
  const collapsedWidth = '64px';

  const sidebarContent = (isMobile: boolean) => {
    const isCollapsed = !isMobile && collapsed;
    return (
      <div
        className={`flex flex-col h-full bg-surface border-r border-border ${isMobile ? 'w-64' : ''}`}
        style={isMobile ? undefined : { width: isCollapsed ? collapsedWidth : width }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-4 h-16 border-b border-border flex-shrink-0">
          <a href={config.brand.href ?? '/'} className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              {config.brand.icon ?? <BoltIcon />}
            </div>
            {!isCollapsed && (
              <span className="text-lg font-heading font-bold text-foreground truncate">
                {config.brand.name}
              </span>
            )}
          </a>
          {config.sidebarCollapsible && !isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto p-1 text-muted hover:text-foreground transition-colors flex-shrink-0"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <CollapseIcon collapsed={collapsed} />
            </button>
          )}
          {isMobile && (
            <button onClick={() => setMobileOpen(false)} className="ml-auto p-1 text-muted hover:text-foreground">
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Custom header */}
        {config.sidebarHeader && !isCollapsed && (
          <div className="px-4 py-3 border-b border-border flex-shrink-0">
            {config.sidebarHeader}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          {config.sections?.map((section, si) => (
            <div key={si} className="mb-2">
              {section.title && !isCollapsed && (
                <div className="px-4 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
                  {section.title}
                </div>
              )}
              {section.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
                  title={isCollapsed ? link.label : undefined}
                >
                  {link.icon && (
                    <span className="text-base flex-shrink-0">{link.icon}</span>
                  )}
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{link.label}</span>
                      {link.badge !== undefined && <Badge value={link.badge} />}
                    </>
                  )}
                </a>
              ))}
            </div>
          ))}

          {/* Flat links fallback (if no sections provided) */}
          {!config.sections && config.links && config.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
              title={isCollapsed ? link.label : undefined}
            >
              {link.icon && <span className="text-base flex-shrink-0">{link.icon}</span>}
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </a>
          ))}
        </div>

        {/* Custom footer */}
        {config.sidebarFooter && !isCollapsed && (
          <div className="px-4 py-3 border-t border-border flex-shrink-0">
            {config.sidebarFooter}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-full z-40 transition-all duration-200">
        {sidebarContent(false)}
      </div>

      {/* Mobile hamburger + overlay */}
      <div className="md:hidden sticky top-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center h-14 px-4">
          <button onClick={() => setMobileOpen(true)} className="p-2 text-foreground" aria-label="Open menu">
            <MenuIcon />
          </button>
          <span className="ml-2 text-lg font-heading font-bold text-foreground">{config.brand.name}</span>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-50">
            {sidebarContent(true)}
          </div>
        </>
      )}
    </>
  );
}

// -- Bottom Tab Bar -----------------------------------------------------------

function BottomTabNav({ config }: { config: NavbarConfig }) {
  const tabs = config.tabs ?? [];
  if (tabs.length === 0) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted hover:text-primary transition-colors relative"
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="absolute -top-0.5 right-0 min-w-[16px] h-4 px-1 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </a>
        ))}
      </div>
    </nav>
  );
}

// -- Main Component -----------------------------------------------------------

interface NavbarProps {
  config: NavbarConfig;
  layout?: LayoutDef;
}

export default function Navbar({ config, layout }: NavbarProps) {
  const variant = config.variant ?? 'topbar';
  const links = config.links ?? (layout ? linksFromLayout(layout) : []);

  return (
    <>
      {variant === 'topbar' && <TopbarNav config={config} links={links} />}
      {variant === 'sidebar' && <SidebarNav config={config} />}
      {variant === 'bottom-tab' && <BottomTabNav config={config} />}

      {config.showBreadcrumbs && config.breadcrumbs && (
        <Breadcrumbs items={config.breadcrumbs} />
      )}
    </>
  );
}

// -- SidebarLayout ------------------------------------------------------------

export function SidebarLayout({ config, children }: { config: NavbarConfig; children: React.ReactNode }) {
  const collapsed = config.sidebarDefaultCollapsed ?? false;
  const width = config.sidebarWidth ?? '256px';
  const collapsedWidth = '64px';
  const sidebarW = collapsed ? collapsedWidth : width;

  return (
    <div className="flex min-h-screen">
      <Navbar config={{ ...config, variant: 'sidebar' }} />
      <main
        className="flex-1 md:transition-all md:duration-200"
        style={{ marginLeft: `var(--sidebar-width, ${sidebarW})` }}
      >
        {config.showBreadcrumbs && config.breadcrumbs && (
          <Breadcrumbs items={config.breadcrumbs} />
        )}
        {children}
      </main>
    </div>
  );
}

export type { NavbarConfig, NavbarBrand, NavbarCta, NavLink, LayoutDef, NavSection, NavTab, BreadcrumbItem } from './types';
