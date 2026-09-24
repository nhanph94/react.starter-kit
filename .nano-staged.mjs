/** @type {import('nano-staged').Configuration} */
export default {
  '*.{js,jsx,mjs,cjs,ts,tsx,mts,cts,json,jsonc,css,html}':
    'biome check --write --no-errors-on-unmatched --files-ignore-unknown=true',
};
