import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const SITE_URL = "https://lamadridlabs.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Throwaway prototype routes (Feature 3). Removed with them.
      disallow: "/prototype/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
