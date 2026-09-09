import { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";

/**
 * Native Next.js 15 robots.txt generator
 * Better performance than static file
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
