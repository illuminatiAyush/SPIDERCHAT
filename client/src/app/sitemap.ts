import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", changeFrequency: "daily" as const, priority: 1.0 },
    { path: "/join", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/feedback", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/security", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/privacy-policy", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/status", changeFrequency: "daily" as const, priority: 0.7 },
    { path: "/support", changeFrequency: "monthly" as const, priority: 0.7 },
    { path: "/terms", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/login", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/signup", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/forgot-password", changeFrequency: "monthly" as const, priority: 0.4 },
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${siteConfig.url}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

