import { MetadataRoute } from "next";

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
    sitemap: "https://optaskflow.vercel.app/sitemap.xml",
  };
}
