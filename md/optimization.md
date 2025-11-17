# Next.js Performance Optimization Plan

## Phase 1: Configuration & Analysis

### Enable TypeScript Typed Routes

Add `typedRoutes: true` to `next.config.ts` for compile-time route checking, preventing broken links and typos in `<Link>` components.

**Files:** `next.config.ts`

### Add Bundle Analyzer

Install and configure `@next/bundle-analyzer` to identify large dependencies and optimization opportunities.

**Files:** `next.config.ts`, `package.json`

### Configure CI Build Cache

Add `.next/cache` configuration for GitHub Actions (or other CI) to speed up builds significantly.

**Files:** Create `.github/workflows/build.yml` or update existing workflow

### Remove JSX Properties in Production

Enable `reactRemoveProperties` to strip `data-tutorial` and `data-testid` attributes from production builds.

**Files:** `next.config.ts`

## Phase 2: Bundle Size & Code Splitting

### Dynamic Import Heavy Components

Lazy load large, non-critical components:

- `AnalyticsDashboard` (uses recharts)
- `YouTubeBackgroundProcessor`
- Chart components (recharts is ~400kb)
- Modal/Dialog components
- AI Chat components

**Files:** Components that import these, using `next/dynamic`

### Optimize Framer Motion Usage

- Use `LazyMotion` with domAnimation for smaller bundle
- Replace heavy motion components with lighter alternatives where possible
- Add `prefersReducedMotion` check

**Files:** Landing page components, animated components

### Code Split Firebase

- Move Firebase admin to server-only contexts
- Lazy load Firebase client libraries
- Use dynamic imports for FCM notifications

**Files:** `firebase.ts`, notification components

## Phase 3: Image & Font Optimization

### Optimize Public Images

- Convert PNGs to WebP format for landing page screenshots
- Add proper `width` and `height` attributes
- Use `priority` prop for above-fold images
- Generate multiple sizes with Image Optimization API

**Files:** `/public/*.png`, `ImageSection.tsx`

### Enhance Font Loading

- Add `display: 'swap'` to font configuration
- Add `preload: true` for critical fonts
- Consider using `font-display: optional` for non-critical text

**Files:** `app/layout.tsx`

### Add Blur Placeholders

Generate blur data URLs for images to prevent layout shift and improve perceived performance.

**Files:** Landing page image components

## Phase 4: Route & Rendering Optimization

### Add Route Segment Config

Configure static/dynamic rendering per route:

- Set `revalidate` times for semi-static pages
- Use `export const dynamic = 'force-static'` where appropriate
- Configure `fetchCache` for optimal data fetching

**Files:** `page.tsx` files in `/app/webapp/*`, landing `page.tsx`

### Implement Partial Prerendering (Experimental)

Enable PPR for faster initial loads with streaming:

```ts
experimental: {
  ppr: true;
}
```

**Files:** `next.config.ts`

### Optimize Metadata Generation

- Enhance with OpenGraph images
- Add Twitter cards
- Use `generateMetadata` for dynamic pages
- Add canonical URLs

**Files:** Layout and page files

## Phase 5: Enhanced Caching & Performance

### Use Native Next.js Sitemap

Replace `next-sitemap` with built-in `app/sitemap.ts` for better integration and performance.

**Files:** Create `app/sitemap.ts`, remove `next-sitemap` dependency

### Add Instrumentation

Create `instrumentation.ts` for monitoring and performance tracking initialization.

**Files:** Create `instrumentation.ts` in root

### Optimize Link Prefetching

Add strategic `prefetch={false}` to links that shouldn't be prefetched, reducing unnecessary requests.

**Files:** Navigation components with many links

## Phase 6: Third-Party Scripts & Dependencies

### Audit & Remove Unused Dependencies

Analyze and remove unused packages to reduce bundle size:

- Check if all imported packages are actually used
- Look for lighter alternatives to heavy libraries

**Files:** `package.json`

### Optimize Third-Party Scripts

- Use `next/script` with proper loading strategies
- Defer non-critical analytics
- Use `worker` strategy for heavy scripts where supported

**Files:** Components loading external scripts

## Phase 7: Runtime Performance

### Add More Suspense Boundaries

Strategically place `<Suspense>` boundaries around:

- Data-fetching components
- Heavy client components
- Analytics dashboards

**Files:** Dashboard pages, data-heavy components

### Reduce Client-Side JavaScript

- Convert more components to RSC where possible
- Move state management closer to components that need it
- Eliminate unnecessary `"use client"` directives

**Files:** Various client components that could be server components

### Optimize Recharts Usage

- Lazy load chart library only when needed
- Consider lighter charting alternatives for simple charts
- Use `ResponsiveContainer` more efficiently

**Files:** `AnalyticsDashboard.tsx` and other chart components

## Expected Improvements

- **Bundle size**: 20-30% reduction through code splitting and optimization
- **LCP (Largest Contentful Paint)**: 30-40% improvement via image optimization
- **FCP (First Contentful Paint)**: 25-35% faster with font optimization
- **TTI (Time to Interactive)**: 20-30% improvement from reduced client JS
- **Lighthouse score**: Target 90+ for all metrics

## Testing Strategy

1. Run bundle analyzer before/after each phase
2. Use Lighthouse CI for automated performance testing
3. Test on slow 3G to verify mobile performance
4. Monitor Core Web Vitals via Vercel Analytics
5. Compare build times with CI cache improvements
