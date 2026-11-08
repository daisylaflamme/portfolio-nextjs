const SITE_NAME = "Daisy Laflamme";

/**
 * Per-page metadata: title (the root layout's template adds " | Daisy Laflamme"),
 * description, canonical URL and Open Graph tags that point at this page.
 * Next replaces openGraph wholesale in child segments, so every field is set here.
 */
export function pageMetadata({ title, description, path }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
    },
  };
}
