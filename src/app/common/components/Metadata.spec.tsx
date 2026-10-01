import { render } from '@testing-library/react';
import { StrictMode } from 'react';
import { expect, test } from 'vitest';

import { Metadata, metadataTitle } from './Metadata';

test('places page and social metadata in the document head', () => {
  const { container, unmount } = render(
    <StrictMode>
      <Metadata
        metadata={{
          title: 'About',
          description: 'About our app',
          canonicalUrl: 'https://example.com/about',
          imageUrl: 'https://example.com/preview.png',
        }}
      />
    </StrictMode>,
  );

  expect(document.title).toBe(`About | ${metadataTitle.default}`);
  expect(container).toBeEmptyDOMElement();
  expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
    'content',
    'About our app',
  );
  expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://example.com/about',
  );
  expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
    'content',
    'https://example.com/about',
  );
  expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://example.com/preview.png',
  );
  expect(document.head.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );

  unmount();
  expect(
    document.head.querySelector(
      'title, meta[name="description"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], meta[name="robots"]',
    ),
  ).toBeNull();
});

test('updates metadata without duplicates and removes optional tags when navigating', () => {
  const { rerender } = render(
    <Metadata
      metadata={{
        title: 'First',
        description: 'First page',
        canonicalUrl: 'https://example.com/first',
        imageUrl: 'https://example.com/first.png',
      }}
    />,
  );

  rerender(<Metadata metadata={{ title: 'Second', description: 'Second page', noIndex: true }} />);

  expect(document.title).toBe(`Second | ${metadataTitle.default}`);
  expect(document.head.querySelectorAll('title')).toHaveLength(1);
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]) {
    expect(document.head.querySelectorAll(selector)).toHaveLength(1);
    expect(document.head.querySelector(selector)).toHaveAttribute('content', 'Second page');
  }
  expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
  expect(document.head.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary',
  );
  expect(
    document.head.querySelector(
      'link[rel="canonical"], meta[property="og:url"], meta[property="og:image"], meta[name="twitter:image"]',
    ),
  ).toBeNull();

  rerender(<Metadata metadata={{ description: 'Home page' }} />);
  expect(document.title).toBe(metadataTitle.default);
  expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
});
