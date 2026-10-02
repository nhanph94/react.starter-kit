declare module 'virtual:theme-registry' {
  type ThemeDefinition = {
    name: string;
    isDefault: boolean;
    prefersDark: boolean;
  };

  export const themes: ThemeDefinition[];
  export const defaultTheme: string;
  export const isTheme: (value: unknown) => value is string;
}
