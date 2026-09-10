const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");

// Use the canonical public origin in static builds even when Cloudflare does not inject env vars.
export const siteUrl = configuredSiteUrl || "https://tajweed101.pages.dev";

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })) };
}
