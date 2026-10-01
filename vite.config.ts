import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig, type HtmlTagDescriptor, loadEnv, type Plugin, type UserConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import { parseEnv } from './src/configs/env/helper.ts';

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
      react(),
      svgr(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
      stripMswWorker(),
      staticMetadataFallback({
        title: appEnv.VITE_APP_TITLE,
        description: appEnv.VITE_APP_DESCRIPTION,
        url: appEnv.VITE_APP_URL,
        robots: appEnv.VITE_APP_ENV === 'production' ? 'index, follow' : 'noindex, nofollow',
      }),
    ],
    resolve: {
      tsconfigPaths: true,
    },
  } as UserConfig;
});
