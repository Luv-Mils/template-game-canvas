/**
 * LayoutShell — Foundation Component (FND-03)
 *
 * Layout orchestrator that renders the correct layout type based on LayoutDef:
 * - SinglePage: all sections in one scrollable page with anchor nav
 * - MultiPage: React Router routes, each page rendering its sections
 *
 * Decouples layout structure from component implementation via sectionMap.
 * Templates register their components in the map; LayoutShell handles the rest.
 *
 * NOTE: react-router-dom is a peer dependency. All current SDK v1 templates
 * include it in package.json. If a future template only uses singlePage,
 * it can safely omit react-router-dom — the import is only used when
 * layout.type === 'multiPage'.
 *
 * Usage:
 *   const sectionMap = { hero: Hero, pricing: Pricing, faq: FAQ };
 *   <LayoutShell layout={layout} sectionMap={sectionMap} />
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { LayoutDef, LayoutShellProps, PageDef } from './types';

// ── Section Renderer ─────────────────────────────────────────────────────────

function SectionRenderer({
  id,
  sectionMap,
}: {
  id: string;
  sectionMap: Record<string, React.ComponentType>;
}) {
  const Component = sectionMap[id];
  if (!Component) return null;
  return <Component />;
}

// ── Sections List (shared between single-page and multi-page) ────────────────

function Sections({
  sections,
  sectionMap,
}: {
  sections: string[];
  sectionMap: Record<string, React.ComponentType>;
}) {
  return (
    <main>
      {sections.map((id) => (
        <section key={id} id={id}>
          <SectionRenderer id={id} sectionMap={sectionMap} />
        </section>
      ))}
    </main>
  );
}

// ── Single Page Layout ───────────────────────────────────────────────────────

function SinglePageLayout({
  sections,
  sectionMap,
}: {
  sections: string[];
  sectionMap: Record<string, React.ComponentType>;
}) {
  return <Sections sections={sections} sectionMap={sectionMap} />;
}

// ── Multi Page Layout ────────────────────────────────────────────────────────

function MultiPageLayout({
  pages,
  sectionMap,
}: {
  pages: PageDef[];
  sectionMap: Record<string, React.ComponentType>;
}) {
  return (
    <BrowserRouter>
      <Routes>
        {pages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<Sections sections={page.sections} sectionMap={sectionMap} />}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

// ── LayoutShell ──────────────────────────────────────────────────────────────

export default function LayoutShell({ layout, sectionMap }: LayoutShellProps) {
  if (layout.type === 'singlePage') {
    return <SinglePageLayout sections={layout.sections ?? []} sectionMap={sectionMap} />;
  }
  return <MultiPageLayout pages={layout.pages ?? []} sectionMap={sectionMap} />;
}

export type { LayoutDef, PageDef, LayoutShellProps } from './types';
