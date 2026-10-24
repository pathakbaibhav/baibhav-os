import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OS } from "@/components/os/OS";
import { Summary } from "@/components/seo/Summary";
import { ogImageFor } from "@/lib/og";
import { ALL_PATHS, descriptionFor, pathFor, routeFor, titleFor } from "@/lib/routes";

// One page per app (/about, /terminal …) and per case study (/projects/<slug>).
// Each boots straight into the OS with that window open.

type Props = { params: Promise<{ path: string[] }> };

// Known pages are prerendered; anything else reaches notFound() below. (With
// dynamicParams = false, Next 15 logs a spurious NoFallbackError on every 404.)
export function generateStaticParams() {
  return ALL_PATHS.map((path) => ({ path }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const route = routeFor((await params).path);
  if (!route) return {};
  const title = titleFor(route);
  const description = descriptionFor(route);
  const url = pathFor(route.app, route.params);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: ogImageFor(url, title) },
  };
}

export default async function AppPage({ params }: Props) {
  const route = routeFor((await params).path);
  if (!route) notFound();
  return (
    <OS initial={route}>
      <Summary route={route} />
    </OS>
  );
}
