import { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";

/**
 * Public URLs only. Next.js serves this at /sitemap.xml on every Vercel
 * production build — no extra plugin or Search Console file upload is required.
 *
 * Do not list /webapp/* here: those routes require a session and are
 * Disallow'd in robots.ts. Listing them fights robots.txt and can make Google treat the sitemap as broken.
 *
 * lastModified is a static date (not `new Date()`) so this file stays a
 * static route. A fresh timestamp on every request made the production
 * sitemap dynamic and returned HTTP 500 behind next-auth middleware.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: "2026-09-10",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: "2026-09-10",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: "2026-09-09",
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: "2026-09-09",
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
