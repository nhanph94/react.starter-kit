import { parseEnv } from './helper';
import type { Env } from './schema';

const env = parseEnv(import.meta.env);

export type { Env };
export { env };
