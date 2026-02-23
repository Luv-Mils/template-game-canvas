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

export interface LayoutShellProps {
  /** The resolved layout definition */
  layout: LayoutDef;
  /**
   * Maps section IDs to React components.
   * Example: { hero: HeroComponent, pricing: PricingComponent }
   */
  sectionMap: Record<string, React.ComponentType>;
}
