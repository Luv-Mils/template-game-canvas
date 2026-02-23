/**
 * Content & Display Components -- Barrel Export
 *
 * All shared content components for Vibe Engine website templates.
 * Import from 'src/shared/content' in any template.
 *
 * Usage:
 *   import { HeroSection, ServicesGrid, PricingTable, MapIntegration } from '../shared/content';
 */

// CTN-01: HeroSection
export { default as HeroSection } from './HeroSection';
export type { HeroConfig, HeroCTA, HeroMedia } from './HeroSection';

// CTN-02: ServicesGrid
export { default as ServicesGrid } from './ServicesGrid';
export type { ServicesGridConfig, ServiceItem } from './ServicesGrid';

// CTN-03: MediaGallery
export { default as MediaGallery } from './MediaGallery';
export type { MediaGalleryConfig, MediaItem } from './MediaGallery';

// CTN-04: TestimonialsCarousel
export { default as TestimonialsCarousel } from './TestimonialsCarousel';
export type { TestimonialsConfig, TestimonialItem, TestimonialAuthor } from './TestimonialsCarousel';

// CTN-05: FAQAccordion
export { default as FAQAccordion } from './FAQAccordion';
export type { FAQConfig, FAQItem } from './FAQAccordion';

// CTN-06: PricingTable
export { default as PricingTable } from './PricingTable';
export type { PricingTableConfig, PricingTier, PricingFeature } from './PricingTable';

// CTN-07: BlogList
export { default as BlogList } from './BlogList';
export type { BlogListConfig, BlogPost, BlogAuthor } from './BlogList';

// CTN-08: StatsCounter
export { default as StatsCounter } from './StatsCounter';
export type { StatsCounterConfig, StatItem } from './StatsCounter';

// CTN-09: TimelineDisplay
export { default as TimelineDisplay } from './TimelineDisplay';
export type { TimelineConfig, TimelineItem } from './TimelineDisplay';

// CTN-10: TeamGrid
export { default as TeamGrid } from './TeamGrid';
export type { TeamGridConfig, TeamMember, TeamSocial } from './TeamGrid';

// CTN-11: CountdownTimer
export { default as CountdownTimer } from './CountdownTimer';
export type { CountdownConfig } from './CountdownTimer';

// CTN-12: CTABanner
export { default as CTABanner } from './CTABanner';
export type { CTABannerConfig } from './CTABanner';

// CTN-13: MapIntegration
export { default as MapIntegration } from './MapIntegration';
export type { MapIntegrationConfig, MapMarker, MapAddress, MapContactCard, ServiceArea } from './MapIntegration';
