# React / Starter KIT

A TypeScript React template built with Vite, Tailwind CSS/DaisyUI, TanStack
Query, Zustand, MSW, Vitest, and Playwright.

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm start:dev
```

Run the quality gates before opening a pull request:

```bash
pnpm check
pnpm test
pnpm build
pnpm test:e2e
```

## Project conventions

- `src/app`: application shell and app-specific shared code.
- `src/bootstrap`: root provider composition.
- `src/configs`: validated environment variables and app configuration.
- `src/libs`: reusable infrastructure (HTTP, state, React helpers, query).
- `src/mocks`: MSW handlers for local development and tests.

The default `apiClient` is intentionally unauthenticated and does not send
credentials by default. Configure `createHttpClient` with an explicit auth
strategy for each project's backend; avoid storing long-lived tokens in web
storage when an HttpOnly-cookie session is available.

Theme state is persisted through `useGlobalStore`. Use `light` or `night`; the
application synchronizes it to `<html data-theme="…">`.

Search engines are allowed to index only production builds. Development and
staging builds receive `noindex, nofollow` metadata automatically.

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
