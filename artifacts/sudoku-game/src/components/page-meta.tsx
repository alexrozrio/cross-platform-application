import { useEffect } from "react";

export interface PageMetaOptions {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  structuredData?: Record<string, unknown>;
}

const SITE_URL = "https://playbraingames.online";
const SITE_NAME = "Play Brain Games";
const OG_IMAGE = `${SITE_URL}/opengraph.jpg`;

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[data-page-meta="${attribute}:${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("data-page-meta", `${attribute}:${key}`);
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function usePageMeta({
  title,
  description,
  path,
  type = "website",
  structuredData,
}: PageMetaOptions) {
  useEffect(() => {
    const url = new URL(path, SITE_URL).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:locale", "en_US");
    upsertMeta("property", "og:image", OG_IMAGE);
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", OG_IMAGE);

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[data-page-meta="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.setAttribute("data-page-meta", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let jsonLd = document.head.querySelector<HTMLScriptElement>(
      'script[data-page-meta="jsonld"]',
    );
    if (structuredData) {
      if (!jsonLd) {
        jsonLd = document.createElement("script");
        jsonLd.type = "application/ld+json";
        jsonLd.setAttribute("data-page-meta", "jsonld");
        document.head.appendChild(jsonLd);
      }
      jsonLd.textContent = JSON.stringify(structuredData);
    } else {
      jsonLd?.remove();
    }
  }, [description, path, structuredData, title, type]);
}
