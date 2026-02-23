import React from 'react';
import { ThemeProvider } from './shared/foundation';
import { Navbar, Footer } from './shared/foundation';

// TODO: Replace with your template's theme and typography config
const theme = {
  colors: {
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    secondary: '#A78BFA',
    background: '#0F0D1A',
    surface: '#1A1830',
    surfaceAlt: '#252340',
    foreground: '#E2E8F0',
    muted: '#94A3B8',
    border: '#2D2B4E',
    accent: '#F59E0B',
  },
  isDark: true,
};

const typography = { heading: 'Inter', body: 'Inter' };

export default function App() {
  return (
    <ThemeProvider theme={theme} typography={typography}>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar config={{ brand: { name: 'platformer' }, links: [] }} />
        <main className="p-8">
          <h1 className="text-3xl font-heading font-bold">Welcome to platformer</h1>
          <p className="mt-4 text-muted">This template is ready for customization.</p>
        </main>
        <Footer config={{ brand: { name: 'platformer' }, linkGroups: [] }} />
      </div>
    </ThemeProvider>
  );
}
