type ThemeDefinition = {
  name: string;
  isDefault: boolean;
  prefersDark: boolean;
};

type ThemeRegistry = {
  defaultTheme: string;
  themes: ThemeDefinition[];
};

type CustomThemeDefinition = {
  name: string;
  isDefault?: boolean;
  prefersDark?: boolean;
};

const pluginBlocks = (css: string, plugin: string) => {
  const blocks: string[] = [];
  const pattern = new RegExp(`@plugin\\s+["']${plugin.replace('/', '\\/')}["']\\s*\\{`, 'g');
  let match = pattern.exec(css);
  while (match) {
    let depth = 1;
    let cursor = pattern.lastIndex;

    while (cursor < css.length && depth > 0) {
      if (css[cursor] === '{') depth += 1;
      if (css[cursor] === '}') depth -= 1;
      cursor += 1;
    }

    if (depth !== 0) throw new Error(`Unclosed @plugin "${plugin}" block.`);

    blocks.push(css.slice(pattern.lastIndex, cursor - 1));
    pattern.lastIndex = cursor;
    match = pattern.exec(css);
  }

  return blocks;
};

const declaration = (block: string, name: string) => {
  const match = block.match(new RegExp(`(?:^|[;\\n])\\s*${name}\\s*:\\s*([^;]+);`, 'm'));
  return match?.[1]?.trim();
};

const themeName = (value: string) => value.replace(/^['"]|['"]$/g, '').trim();

const validateThemeName = (name: string) => {
  if (!/^[a-z][a-z0-9_-]*$/i.test(name)) {
    throw new Error(
      `Theme name "${name}" must contain only letters, numbers, hyphens, or underscores.`,
    );
  }
  return name;
};

const booleanDeclaration = (value: string | undefined, name: string) => {
  if (value == null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} must be true or false.`);
};

const parseThemeList = (block: string): ThemeDefinition[] => {
  const value = declaration(block, 'themes');
  if (!value) return [];
  if (value === 'all') {
    throw new Error(
      '`themes: all` is not supported because the theme switcher needs explicit names.',
    );
  }

  return value.split(',').map((entry) => {
    const tokens = entry.trim().split(/\s+/);
    const name = themeName(tokens.shift() ?? '');
    if (!name) throw new Error('Each theme in `themes:` must have a name.');

    return {
      name: validateThemeName(name),
      isDefault: tokens.includes('--default'),
      prefersDark: tokens.includes('--prefersdark'),
    };
  });
};

const parseCustomThemes = (css: string): CustomThemeDefinition[] =>
  pluginBlocks(css, 'daisyui/theme').map((block) => {
    const name = themeName(declaration(block, 'name') ?? '');
    if (!name) throw new Error('Each @plugin "daisyui/theme" block must declare a name.');

    return {
      name: validateThemeName(name),
      isDefault: booleanDeclaration(declaration(block, 'default'), 'default'),
      prefersDark: booleanDeclaration(declaration(block, 'prefersdark'), 'prefersdark'),
    };
  });

const assertUniqueNames = (themes: { name: string }[], source: string) => {
  const names = new Set<string>();
  for (const theme of themes) {
    if (names.has(theme.name))
      throw new Error(`Theme "${theme.name}" is declared more than once in ${source}.`);
    names.add(theme.name);
  }
};

const parseThemeRegistry = (css: string): ThemeRegistry => {
  const configuredThemes = pluginBlocks(css, 'daisyui').flatMap(parseThemeList);
  const customThemes = parseCustomThemes(css);
  assertUniqueNames(configuredThemes, 'themes:');
  assertUniqueNames(customThemes, 'custom theme blocks');
  const customThemesByName = new Map(customThemes.map((theme) => [theme.name, theme]));
  const configuredNames = new Set(configuredThemes.map((theme) => theme.name));
  const themes = [
    ...configuredThemes.map((theme) => {
      const customTheme = customThemesByName.get(theme.name);
      return {
        ...theme,
        isDefault: customTheme?.isDefault ?? theme.isDefault,
        prefersDark: customTheme?.prefersDark ?? theme.prefersDark,
      };
    }),
    ...customThemes
      .filter((theme) => !configuredNames.has(theme.name))
      .map((theme) => ({
        name: theme.name,
        isDefault: theme.isDefault ?? false,
        prefersDark: theme.prefersDark ?? false,
      })),
  ];

  if (themes.length === 0) {
    throw new Error('Declare at least one DaisyUI theme in main.css.');
  }

  const defaultThemes = themes.filter((theme) => theme.isDefault);
  if (defaultThemes.length > 1) {
    throw new Error(
      `Only one theme can be default: ${defaultThemes.map((theme) => theme.name).join(', ')}.`,
    );
  }

  return {
    themes,
    defaultTheme: defaultThemes[0]?.name ?? themes[0].name,
  };
};

const themeRegistryModule = (registry: ThemeRegistry) => `
  export const themes = ${JSON.stringify(registry.themes)};
  export const defaultTheme = ${JSON.stringify(registry.defaultTheme)};
  export const isTheme = (value) => typeof value === 'string' && themes.some((theme) => theme.name === value);
`;

export type { ThemeDefinition, ThemeRegistry };
export { parseThemeRegistry, themeRegistryModule };
