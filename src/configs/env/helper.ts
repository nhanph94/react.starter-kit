import type { z } from 'zod';

import { type AppEnv, appEnvSchema, type Env, envSchema } from './schema.ts';

const formatEnvError = (error: z.ZodError) => {
  const errorsByVariable = error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const varName = issue.path.join('.') || 'UNKNOWN_VARIABLE';
    acc[varName] ??= [];
    acc[varName].push(issue.message);
    return acc;
  }, {});

  const lines = ['', '❌ Enviroment variables are invalid:'];

  Object.entries(errorsByVariable).forEach(([varName, messages], index, entries) => {
    lines.push(`📌 ${varName}`);
    messages.forEach((message, messageIndex) => {
      const prefix = messageIndex === messages.length - 1 ? '    └─' : '    ├─';
      lines.push(`${prefix} ${message}`);
    });
    if (index < entries.length - 1) lines.push('');
  });

  lines.push('');
  return lines.join('\n');
};

const parseEnv = (raw: unknown): Env => {
  const parsed = envSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
};

const parseAppEnv = (raw: unknown): AppEnv => {
  const parsed = appEnvSchema.safeParse(raw);

  if (!parsed.success) {
    throw new Error(formatEnvError(parsed.error));
  }

  return parsed.data;
};

export { parseAppEnv, parseEnv };
