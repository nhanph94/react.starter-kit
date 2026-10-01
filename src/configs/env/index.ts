import { parseAppEnv, parseEnv } from './helper';
import type { AppEnv, Env } from './schema';

export type { AppEnv, Env };

export default {
  ...parseEnv(import.meta.env),
  MODE: parseAppEnv(import.meta.env.MODE),
};
