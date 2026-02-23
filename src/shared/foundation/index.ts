/**
 * Foundation Components — Barrel Export
 *
 * All shared foundation components for Vibe Engine templates.
 * Import from 'src/shared/foundation' in any template.
 *
 * Usage:
 *   import { ThemeProvider, useTheme, Navbar, SidebarLayout, Footer, Modal } from '../shared/foundation';
 */

// FND-01: ThemeEngine
export { ThemeProvider, useTheme, hexToRgb, COLOR_TOKENS, FONT_TOKENS } from './ThemeEngine';
export type { ThemeConfig, TypographyConfig, ThemeContextValue, ThemeColors, VibeConfig } from './ThemeEngine';

// FND-02: Navbar (enhanced with sidebar, bottom-tab, breadcrumbs)
export { default as Navbar, SidebarLayout } from './Navbar';
export type { NavbarConfig, NavbarBrand, NavbarCta, NavLink, NavSection, NavTab, BreadcrumbItem } from './Navbar';

// FND-03: LayoutShell
export { default as LayoutShell } from './LayoutShell';
export type { LayoutDef, PageDef, LayoutShellProps } from './LayoutShell';

// FND-04: Footer
export { default as Footer } from './Footer';
export type { FooterConfig, FooterLink, FooterLinkGroup, FooterBrand } from './Footer';

// FND-05: AuthModule
export { default as AuthCard } from './AuthModule';
export type { AuthConfig, AuthView } from './AuthModule';

// FND-06: FormsEngine
export { Form, Input, Textarea, Select } from './FormsEngine';
export type { FormConfig, FormField, FieldType, SelectOption } from './FormsEngine';

// FND-07: Modal
export { default as Modal } from './Modal';
export type { ModalProps } from './Modal';

// FND-08: ToastLoading
export { ToastProvider, useToast, Spinner, Skeleton, SkeletonText, SkeletonCard } from './ToastLoading';
export type { Toast, ToastType, ToastContextValue } from './ToastLoading';
