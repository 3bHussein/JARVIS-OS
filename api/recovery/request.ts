// Vercel's file-system function routing needs an explicit nested entry point.
// Reuse the same Origin checks, recovery limits and server-only configuration.
export {default} from '../[...path].ts';
