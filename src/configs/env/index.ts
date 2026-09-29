import { parseEnv } from './helper';
import type { Env } from './schema';

export type { Env };
export default parseEnv(import.meta.env);
