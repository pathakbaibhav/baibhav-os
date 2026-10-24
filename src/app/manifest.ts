import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/routes";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "baibhavOS",
    short_name: "baibhavOS",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#070A11",
    theme_color: "#070A11",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
