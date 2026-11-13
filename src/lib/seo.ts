export interface SeoMetaPayload {
  title: string;
  description: string;
  siteName: string;
  ogImage?: string;
  pathname?: string;
  ownerName?: string;
  jobTitle?: string;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (typeof document === 'undefined' || !content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  if (typeof document === 'undefined' || !href) return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLd(payload: SeoMetaPayload, canonicalUrl: string) {
  if (typeof document === 'undefined') return;
  const scriptId = 'studio-schema-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: payload.siteName,
    description: payload.description,
    url: canonicalUrl,
    ...(payload.ogImage ? { image: payload.ogImage } : {}),
    ...(payload.ownerName
      ? {
          founder: {
            '@type': 'Person',
            name: payload.ownerName,
            ...(payload.jobTitle ? { jobTitle: payload.jobTitle } : {}),
          },
        }
      : {}),
  };
  script.textContent = JSON.stringify(structuredData);
}

export function applySeoMetadata(payload: SeoMetaPayload) {
  if (typeof document === 'undefined') return;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = payload.pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const canonicalUrl = `${origin}${path}`;

  document.title = payload.title;
  upsertMeta('name', 'description', payload.description);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', payload.title);
  upsertMeta('property', 'og:description', payload.description);
  upsertMeta('property', 'og:site_name', payload.siteName);
  upsertMeta('property', 'og:url', canonicalUrl);
  if (payload.ogImage) {
    upsertMeta('property', 'og:image', payload.ogImage);
    upsertMeta('name', 'twitter:image', payload.ogImage);
  }
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', payload.title);
  upsertMeta('name', 'twitter:description', payload.description);
  upsertCanonical(canonicalUrl);
  upsertJsonLd(payload, canonicalUrl);
}
