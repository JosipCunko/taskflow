import { MetadataRoute } from "next";
import { SITE_URL } from "./_lib/site";

/**
 * Native Next.js 15 sitemap generator
 * Replaces next-sitemap for better performance and integration
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const currentDate = new Date();

  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/webapp`,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/webapp/tasks`,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/webapp/today`,
      lastModified: currentDate,
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/webapp/notes`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/webapp/profile`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/webapp/calendar`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/webapp/completed`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/webapp/fitness`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/webapp/health`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/webapp/ai`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/webapp/inbox`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}
