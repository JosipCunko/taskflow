import { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";

/**
 * Native Next.js robots.txt generator, served at /robots.txt after `next build`.
 *
 * Allow the public marketing/auth/legal pages (/, /login, /privacy, /terms).
 * Disallow the signed-in app and APIs so Google does not crawl private data.
 * The Sitemap line is how Google discovers /sitemap.xml without a manual upload.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/webapp/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
