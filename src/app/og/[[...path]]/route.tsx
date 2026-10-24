import { ogImage } from "@/lib/og";
import { ALL_PATHS, routeFor } from "@/lib/routes";

// Link-preview cards: /og for the desktop, /og/<page path> for each page.
// Prerendered at build time, like the pages themselves.

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ path: [] }, ...ALL_PATHS.map((path) => ({ path }))];
}

export async function GET(_req: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return ogImage(routeFor((await params).path) ?? null);
}
