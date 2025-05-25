// singleton instance to make sure single worker shares the state
// else one worker would compile, the other would not be able to use
// the compied proof and would have to do this again.

import * as Comlink from 'comlink';

// 🧪 Optional: Guard Against Reload in Hot Module Replacement (HMR)
// If you're using Vite with HMR, you can do this to avoid duplicate workers during development:
if (!globalThis.__proofWorker__) {
  const worker = new Worker(new URL('./proofWorker.js', import.meta.url), {
    type: 'module',
  });
  globalThis.__proofWorker__ = Comlink.wrap(worker);
}

export function getProofWorker() {
  return globalThis.__proofWorker__;
}
