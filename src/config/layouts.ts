export interface PageDef {
  path: string;
  name: string;
  sections: string[];
}

export interface LayoutDef {
  id: string;
  type: 'singlePage' | 'multiPage';
  sections?: string[];
  pages?: PageDef[];
}

export const LAYOUTS: Record<string, LayoutDef> = {
  agency: {
    id: 'agency',
    type: 'multiPage',
    pages: [
      { path: '/', name: 'Home', sections: ['hero', 'portfolio-gallery', 'services-grid', 'testimonials'] },
      { path: '/work', name: 'Work', sections: ['portfolio-gallery', 'testimonials'] },
      { path: '/about', name: 'About', sections: ['about-section', 'team-grid', 'stats-counter'] },
      { path: '/contact', name: 'Contact', sections: ['contact-form'] },
    ],
  },
  corporate: {
    id: 'corporate',
    type: 'multiPage',
    pages: [
      { path: '/', name: 'Home', sections: ['hero', 'trust-badges', 'about-section', 'services-grid', 'stats-counter', 'testimonials'] },
      { path: '/services', name: 'Services', sections: ['services-grid', 'stats-counter'] },
      { path: '/team', name: 'Team', sections: ['team-grid', 'about-section'] },
      { path: '/contact', name: 'Contact', sections: ['contact-form'] },
    ],
  },
  starter: {
    id: 'starter',
    type: 'singlePage',
    sections: ['hero', 'services-grid', 'contact-form'],
  },
};

export function getLayout(id: string): LayoutDef {
  return LAYOUTS[id] || LAYOUTS.agency;
}
