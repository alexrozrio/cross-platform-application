// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { usePageMeta, type PageMetaOptions } from '../components/page-meta';

function MetaHarness(props: PageMetaOptions) {
  usePageMeta(props);
  return null;
}

describe('usePageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = '';
  });

  afterEach(cleanup);

  it('sets document title with the site name suffix', () => {
    render(
      createElement(MetaHarness, { title: 'Guides', description: 'Game guides', path: '/guides' }),
    );
    expect(document.title).toBe('Guides | Play Brain Games . Online');
  });

  it('does not double the site name when already present', () => {
    render(
      createElement(MetaHarness, {
        title: 'Free Puzzle Games | Play Brain Games . Online',
        description: 'desc',
        path: '/',
      }),
    );
    expect(document.title).toBe('Free Puzzle Games | Play Brain Games . Online');
  });

  it('sets meta description, canonical and Open Graph tags', () => {
    render(
      createElement(MetaHarness, {
        title: 'Memory',
        description: 'Play memory match',
        path: '/memory',
      }),
    );
    const desc = document.head.querySelector('meta[name="description"]');
    expect(desc?.getAttribute('content')).toBe('Play memory match');
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://playbraingames.online/memory/');
    const ogUrl = document.head.querySelector('meta[property="og:url"]');
    expect(ogUrl?.getAttribute('content')).toBe('https://playbraingames.online/memory/');
  });

  it('injects and removes JSON-LD structured data', () => {
    const { rerender } = render(
      createElement(MetaHarness, {
        title: 'About',
        description: 'd',
        path: '/about',
        structuredData: { '@type': 'AboutPage' },
      }),
    );
    const ld = document.head.querySelector('script[data-page-meta="jsonld"]');
    expect(ld?.textContent).toContain('AboutPage');

    rerender(
      createElement(MetaHarness, { title: 'About', description: 'd', path: '/about' }),
    );
    expect(document.head.querySelector('script[data-page-meta="jsonld"]')).toBeNull();
  });
});
