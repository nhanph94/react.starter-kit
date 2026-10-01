# React Starter Kit

A production-oriented React SPA template built with TypeScript and Vite. It
provides strict tooling, validated configuration, reusable application
infrastructure, and automated quality checks without prescribing a router or
backend architecture.

## Included

- React 19, TypeScript, and Vite.
- Tailwind CSS 4 with DaisyUI, light/night themes, and an accessible theme toggle.
- TanStack Query for server state and Zustand for client state.
- Axios HTTP client with configurable authentication and refresh-token support.
- Zod-validated environment variables and MSW network mocks.
- Error boundary, toast notifications, promise-based modal API, and metadata helpers.
- Vitest, React Testing Library, Playwright, Biome, Husky, Commitlint, and GitHub Actions.

## Requirements

- Node.js 22 or later.
- pnpm 12 or later. Enable Corepack if needed:

  ```bash
  corepack enable
  ```

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm start:dev
```

The development server starts at `http://localhost:5173` by default. MSW mocks
the sample `/api/health` endpoint in development; unhandled requests pass
through to the configured API.

## Configuration

All browser-exposed variables use the `VITE_` prefix and are validated at
startup. Never put secrets, private API keys, or credentials in these values.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_APP_ENV` | Yes | `development`, `staging`, or `production`. |
| `VITE_APP_TITLE` | No | Default document and social title. |
| `VITE_APP_DESCRIPTION` | No | Default document and social description. |
| `VITE_APP_URL` | No | Absolute canonical public URL. |
| `VITE_API_BASE_URL` | Yes | Absolute API base URL, or an empty string for same-origin APIs. |
| `VITE_API_REQUEST_TIMEOUT` | No | Positive request timeout in milliseconds; defaults to `10000`. |
| `VITE_API_REQUEST_WITH_CREDENTIALS` | No | Set to `true` only for a cookie-based API requiring cross-origin credentials. |
| `VITE_IDB_STORE` | No | IndexedDB database name; defaults to the package name. |

Vite's build mode and `VITE_APP_ENV` are intentionally separate. Set
`VITE_APP_ENV=production` for production deployment; development and staging
automatically emit `noindex, nofollow` metadata.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm start:dev` | Run the Vite development server. |
| `pnpm start:preview` | Serve the production build locally. |
| `pnpm build` | Type-check and generate a production build. |
| `pnpm check` | Run Biome formatting and lint checks. |
| `pnpm check:fix` | Apply safe Biome formatting and lint fixes. |
| `pnpm test` | Run unit and component tests once. |
| `pnpm test:coverage` | Run tests and generate coverage reports. |
| `pnpm test:e2e` | Run Playwright browser tests. |
| `pnpm test:e2e:ui` | Open the Playwright UI runner. |

Install the Playwright browser once on a new machine:

```bash
pnpm exec playwright install chromium
```

Before opening a pull request, run:

```bash
pnpm check
pnpm test
pnpm build
pnpm test:e2e
```

## Project structure

```text
src/
  app/          Application shell and app-specific shared code
  bootstrap/    Root provider composition
  configs/      Validated environment variables and application configuration
  libs/         Reusable infrastructure: HTTP, query, state, and React helpers
  mocks/        MSW browser, server, and request handlers
  resources/    Global styles and source assets
test/           Shared test utilities and Playwright tests
```

The template is deliberately router-agnostic. Add React Router, TanStack Router,
or another routing solution only when product requirements are clear. Keep
domain-specific code in feature modules rather than expanding `app/` with
unrelated business logic.

## State, data fetching, and storage

- Use TanStack Query for remote/server state. `QueryProvider` owns the shared
  `QueryClient` and exposes Query Devtools only in development.
- Use Zustand for local client state. `createStore` supports Immer, persistence,
  Redux DevTools, selector subscriptions, and local/session/IndexedDB storage.
- The global store persists the selected `light` or `night` theme and migrates
  the legacy `dark` value.

Use IndexedDB only when a feature needs durable client-side data; it adds
schema and versioning concerns that most application state does not require.

## HTTP and authentication

`apiClient` is unauthenticated by default and does not send cross-origin
credentials. Each backend has different session, refresh, and logout semantics.

For an HttpOnly-cookie session, explicitly opt in to credentials:

```ts
import { createHttpClient } from '@/libs/http';

export const apiClient = createHttpClient({
  baseURL: appConfig.apiBaseUrl,
  withCredentials: true,
});
```

For a bearer-token backend, configure the supplied `auth` option with the
backend's refresh path and header/body format. Prefer in-memory tokens or
HttpOnly cookies. Persist browser tokens only when the product threat model
accepts the XSS risk, and implement logout/session-expiry behavior in the app.

## Metadata and SEO

Use `Metadata` once per active page. React 19 hoists its tags into the document
head.

```tsx
<Metadata
  metadata={{
    title: 'About',
    description: 'Learn more about the application.',
    canonicalUrl: 'https://example.com/about',
  }}
/>
```

Vite injects fallback title, description, canonical URL, Open Graph, Twitter,
and robots tags into the initial HTML response. For page-specific metadata to
be crawlable, add prerendering or SSR when introducing routing.

## Testing and CI

Unit and component tests live beside the source they cover. `@test` exports a
custom render helper using the production provider stack. MSW starts for tests
in `test/setup.ts`; use `server.use(...)` to override handlers per test.

Playwright smoke tests live in `test/e2e`. GitHub Actions runs formatting,
coverage, production build, and E2E tests on pull requests and pushes to
`main`, then uploads coverage and Playwright artifacts.

## Deployment and security

Deploy the contents of `dist/` to a static host after `pnpm build`. Configure
hosting-layer security headers to match the application's real origins:

- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- Referrer-Policy

Do not enable credentials, persistent bearer tokens, analytics origins, or a
service worker by default without a product-specific security review.

## After cloning this template

1. Rename the package and update author metadata.
2. Replace `.env` values with the project's environments.
3. Update the title, description, canonical URL, favicon, and social image.
4. Choose a router only if the project needs client-side navigation.
5. Define the authentication model with the backend team.
6. Add product features, API schemas, and tests before deployment.
7. Add a license and contribution policy before publishing publicly.
