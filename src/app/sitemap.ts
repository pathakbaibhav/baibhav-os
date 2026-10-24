import type { MetadataRoute } from "next";
import { ALL_PATHS, SITE_URL } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return [[], ...ALL_PATHS].map((segs) => ({ url: `${SITE_URL}/${segs.join("/")}` }));
}
