# React / Starter KIT

## Metadata / SEO

`Metadata` from `@/app/common/components` uses a single `metadata` object. The
home page omits `title` and uses the default site title; a child page receives
`Page title | Site Name`.

```tsx
<Metadata metadata={{ title: 'About', description: 'Learn more about My app.' }} />
```

Vite adds fallback metadata to the initial `index.html` response for crawlers
that do not execute JavaScript. Configure `VITE_APP_TITLE`,
`VITE_APP_DESCRIPTION`, and optionally `VITE_APP_URL` for the default title,
description, canonical URL, and Open Graph URL. Page-specific metadata requires
prerendering or SSR when routing is added.
