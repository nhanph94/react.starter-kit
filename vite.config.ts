import { readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, type HtmlTagDescriptor, loadEnv, type Plugin, type UserConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import { parseEnv } from './src/configs/env/helper.ts';
import { APP_ENV } from './src/configs/env/schema.ts';
import {
  parseThemeRegistry,
  type ThemeRegistry,
  themeRegistryModule,
} from './src/configs/theme/registry.ts';

const THEME_REGISTRY_MODULE = 'virtual:theme-registry';
const RESOLVED_THEME_REGISTRY_MODULE = `\0${THEME_REGISTRY_MODULE}`;
const THEME_CSS_FILE = resolve(process.cwd(), 'src/resources/styles/main.css');

const themeRegistryFromCss = (css = readFileSync(THEME_CSS_FILE, 'utf8')) =>
  parseThemeRegistry(css);

const replaceGeneratedRegion = (css: string, key: string, contents: string) => {
  const region = new RegExp(
    `(/\\* @generated:${key} \\*/)[\\s\\S]*?(/\\* @endgenerated \\*/)`,
    'g',
  );
  if (!region.test(css)) throw new Error(`Missing generated CSS region: ${key}.`);

  return css.replace(region, `$1\n${contents}\n$2`);
};

const generatedDarkVariant = (registry: ThemeRegistry) => {
  const darkSelectors = registry.themes
    .filter((theme) => theme.prefersDark)
    .flatMap((theme) => [
      `:root[data-theme="${theme.name}"]`,
      `:root[data-theme="${theme.name}"] *`,
    ]);
  const explicitThemeRule = darkSelectors.length
    ? `  &:where(${darkSelectors.join(', ')}) {\n    @slot;\n  }\n`
    : '';

  return `${explicitThemeRule}
  @media (prefers-color-scheme: dark) {
    &:where(:root:not([data-theme]), :root:not([data-theme]) *) {
      @slot;
    }
  }`;
};

const generatedColorSchemes = (registry: ThemeRegistry) => `:root:not([data-theme]) {
  color-scheme: light dark;
}
${registry.themes
  .map(
    (theme) => `:root[data-theme="${theme.name}"] {
  color-scheme: only ${theme.prefersDark ? 'dark' : 'light'};
}`,
  )
  .join('\n')}`;

const applyThemeCss = (css: string, registry: ThemeRegistry) =>
  replaceGeneratedRegion(
    replaceGeneratedRegion(css, 'theme-dark-variant', generatedDarkVariant(registry)),
    'theme-color-schemes',
    generatedColorSchemes(registry),
  );

const themeInitScript = (registry: ThemeRegistry) => `
  (() => {
    const themeNames = new Set(${JSON.stringify(registry.themes.map((theme) => theme.name))});
    try {
      const persisted = JSON.parse(localStorage.getItem('global') || 'null');
      const theme = persisted?.state?.theme;

      if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else if (theme === 'dark' && themeNames.has('night')) {
        document.documentElement.dataset.theme = 'night';
      } else if (themeNames.has(theme)) {
        document.documentElement.dataset.theme = theme;
      }
    } catch {
      // Use the DaisyUI default theme when browser storage is unavailable.
    }
  })();
`;

const themeRegistry = (): Plugin => ({
  name: 'theme-registry',
  enforce: 'pre',
  resolveId(id) {
    return id === THEME_REGISTRY_MODULE ? RESOLVED_THEME_REGISTRY_MODULE : undefined;
  },
  load(id) {
    if (id !== RESOLVED_THEME_REGISTRY_MODULE) return undefined;

    return themeRegistryModule(themeRegistryFromCss());
  },
  transform(code, id) {
    if (resolve(id.split('?')[0]) !== THEME_CSS_FILE) return undefined;
    return { code: applyThemeCss(code, themeRegistryFromCss(code)), map: null };
  },
  transformIndexHtml() {
    return [{ tag: 'script', children: themeInitScript(themeRegistryFromCss()), injectTo: 'head' }];
  },
  handleHotUpdate({ file, server }) {
    if (resolve(file) !== THEME_CSS_FILE) return;

    const module = server.moduleGraph.getModuleById(RESOLVED_THEME_REGISTRY_MODULE);
    if (module) server.moduleGraph.invalidateModule(module);
    server.ws.send({ type: 'full-reload' });
  },
});

const stripMswWorker = (): Plugin => {
  let outDir = '';

  return {
    name: 'strip-msw-worker',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      rmSync(resolve(outDir, 'mockServiceWorker.js'), { force: true });
    },
  };
};

const staticMetadataFallback = ({
  title,
  description,
  url,
  robots,
}: {
  title: string;
  description: string;
  url?: string;
  robots: string;
}): Plugin => ({
  name: 'static-metadata-fallback',
  transformIndexHtml(): HtmlTagDescriptor[] {
    const tags: HtmlTagDescriptor[] = [
      { tag: 'title', children: title, injectTo: 'head' },
      { tag: 'meta', attrs: { name: 'description', content: description }, injectTo: 'head' },
      { tag: 'meta', attrs: { name: 'robots', content: robots }, injectTo: 'head' },
      { tag: 'meta', attrs: { property: 'og:type', content: 'website' }, injectTo: 'head' },
      { tag: 'meta', attrs: { property: 'og:title', content: title }, injectTo: 'head' },
      {
        tag: 'meta',
        attrs: { property: 'og:description', content: description },
        injectTo: 'head',
      },
      { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary' }, injectTo: 'head' },
      { tag: 'meta', attrs: { name: 'twitter:title', content: title }, injectTo: 'head' },
      {
        tag: 'meta',
        attrs: { name: 'twitter:description', content: description },
        injectTo: 'head',
      },
    ];

    if (url) {
      tags.push(
        { tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' },
        { tag: 'meta', attrs: { property: 'og:url', content: url }, injectTo: 'head' },
      );
    }

    return tags;
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let appEnv: ReturnType<typeof parseEnv>;

  try {
    appEnv = parseEnv(env);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  return {
    plugins: [
      themeRegistry(),
      react(),
      svgr(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      stripMswWorker(),
      staticMetadataFallback({
        title: appEnv.VITE_APP_TITLE,
        description: appEnv.VITE_APP_DESCRIPTION,
        url: appEnv.VITE_APP_URL,
        robots: mode === APP_ENV.PRODUCTION ? 'index, follow' : 'noindex, nofollow',
      }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  } as UserConfig;
});
