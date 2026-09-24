import { gitmojis } from 'gitmojis';

//#region gitmojiRule
// Non-capturing so header groups stay 1=type, 2=scope, 3=subject.
const gitmojiPattern =
  '(?::[a-z0-9_+-]+:|\\p{Extended_Pictographic}\\p{Emoji_Modifier}?\\uFE0F?(?:\\u200D\\p{Extended_Pictographic}\\p{Emoji_Modifier}?\\uFE0F?)*)';

const gitmojiToken = new RegExp(`^${gitmojiPattern}`, 'u');

const supportedGitmojis = new Set(
  gitmojis.flatMap(({ emoji, code }) => [emoji.replaceAll('\uFE0F', ''), code]),
);

function headerPattern(breaking = false) {
  const marker = breaking ? '!' : '!?';
  return new RegExp(`^(?:${gitmojiPattern} )?(\\w*)(?:\\((.*)\\))?${marker}: (.*)$`, 'u');
}

function gitmojiRule(parsed, when = 'always') {
  const header = parsed.header ?? '';
  const token = header.match(gitmojiToken)?.[0];
  if (!token) return [true];

  const candidate = token.startsWith(':') ? token : token.replaceAll('\uFE0F', '');
  const known = supportedGitmojis.has(candidate);

  if (when !== 'always') {
    return [!known, known ? `gitmoji "${token}" is not allowed` : undefined];
  }

  if (!known) {
    return [false, `"${token}" is not a valid gitmoji, see https://gitmoji.dev`];
  }

  const rest = header.slice(token.length);
  if (rest.startsWith(' ') && !rest.startsWith('  ')) return [true];

  return [false, `gitmoji must be followed by a single space`];
}
//#endregion

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: headerPattern(),
      breakingHeaderPattern: headerPattern(true),
    },
  },
  plugins: [{ rules: { 'gitmoji-enum': gitmojiRule } }],
  rules: { 'gitmoji-enum': [2, 'always'] },
};
