// next.config.js
//
// 1. Allow Node to execute the TypeScript / ESM config.
// 2. Import the existing config (default export from next.config.mjs / .ts).
// 3. Merge in a generateBuildId that guarantees cache-busting filenames.
//
require('ts-node/register');

const baseConfig =
  // If you keep the file as next.config.mjs
  //   → its default export lands on `.default`
  // If you rename to next.config.ts
  //   → ts-node loads it the same way
  (require('./next.config.mjs')?.default) ||
  {};

/**
 * Force a new build-id on every `next build` / `docker build`
 * so browsers & CDNs never reuse stale JS chunks.
 */
const buildId = () => Date.now().toString();

module.exports = {
  // spread existing settings first …
  ...baseConfig,

  // … then override / add build-id
  generateBuildId: baseConfig.generateBuildId || buildId,
};
