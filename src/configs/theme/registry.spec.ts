import { describe, expect, test } from 'vitest';

import { parseThemeRegistry } from './registry';

describe('parseThemeRegistry', () => {
  test('combines configured and custom themes in declaration order', () => {
    const registry = parseThemeRegistry(`
      @plugin "daisyui" {
        themes: light --default, night --prefersdark;
      }
      @plugin "daisyui/theme" {
        name: ocean;
        prefersdark: true;
      }
    `);

    expect(registry).toEqual({
      defaultTheme: 'light',
      themes: [
        { name: 'light', isDefault: true, prefersDark: false },
        { name: 'night', isDefault: false, prefersDark: true },
        { name: 'ocean', isDefault: false, prefersDark: true },
      ],
    });
  });

  test('uses the first theme when no default is declared', () => {
    expect(parseThemeRegistry('@plugin "daisyui" { themes: cupcake, dracula; }').defaultTheme).toBe(
      'cupcake',
    );
  });

  test('merges a custom block with the matching configured theme', () => {
    const registry = parseThemeRegistry(`
      @plugin "daisyui" { themes: light --default, night --prefersdark; }
      @plugin "daisyui/theme" { name: night; prefersdark: false; }
    `);

    expect(registry.themes).toEqual([
      { name: 'light', isDefault: true, prefersDark: false },
      { name: 'night', isDefault: false, prefersDark: false },
    ]);
  });

  test.each([
    ['themes: all', '@plugin "daisyui" { themes: all; }'],
    [
      'duplicate custom names',
      '@plugin "daisyui/theme" { name: ocean; } @plugin "daisyui/theme" { name: ocean; }',
    ],
    ['missing custom name', '@plugin "daisyui/theme" { prefersdark: true; }'],
    ['multiple defaults', '@plugin "daisyui" { themes: light --default, night --default; }'],
  ])('rejects %s', (_label, css) => {
    expect(() => parseThemeRegistry(css)).toThrow();
  });
});
