# website

ID-Mask client app. It fetches Smart-ID data through the zk-Oracle, compiles and runs ZkPrograms in the browser, and saves or verifies proofs. Everything sensitive happens client-side. It's deployed on Vercel. See `../CLAUDE.md` for the cross-repo picture. `public/app.md` describes the product and the proof JSON format.

## Commands

```sh
npm run dev       # vite dev server
npm run build     # vite build -> dist/
npm run preview
```

It requires Node >= 24. There are no tests and no linter configured.

## Structure

- `src/main.js`: creates the app with naive-ui, Vuex, and Vercel analytics.
- `src/App.vue`: **no vue-router**. It hand-rolls routing on `window.location.pathname`:
  - `/proofOwnershipValidation` renders `ProofOwnershipValidation`
  - `/passkeysChallengePage` renders `PasskeysChallengePage`
  - anything else renders the landing page, `ProofPage`, and the footer
- `src/store/modules/`: namespaced Vuex modules.
  - `settings`: network (devnet/mainnet endpoints), the `zkOracle` base URL, default passkey and signature values, and the cache toggle.
  - `proofs`: the proof catalogue and deployed contract addresses.
  - `pid` and `sanctions`: fetched data plus mock data.
  - `theme`.
- `src/components/proofSteps/`: the proof-creation flow. `getPersonalData`, then `createProofOfX`, then `saveProof` (Google or Apple Wallet, Mina). The `compile.js` step fetches precompiled prover/verifier cache from GCS.
- `src/components/proofSteps/utils/`:
  - `proofWorker.js` and `proofWorker.singleton.js`: o1js runs in a module Web Worker via Comlink. It's a **singleton**, so compiled state is shared; always use `getProofWorker()`.
  - `passkeysUtils.js` and `passkeysSetup.js`: WebAuthn handling (cbor-web, ox).
  - `walletUtils.js`
- `src/components/zkPrograms/`: **generated**. These are the tsc output of `../smart-contracts/src`. Don't edit them by hand; rebuild in smart-contracts and copy them over.
- `src/components/componentUtils/`: verification UI. This includes the passkey challenge and proof-ownership flows (a QR code is scanned on another device, which talks through oracle session endpoints) and the public-output display.

## Gotchas

- o1js needs `SharedArrayBuffer`, so **COOP/COEP headers are required**. `vite.config.js` sets them for dev and `vercel.json` sets them in production, where the Vercel config also rewrites every path to `/`. Keep both when touching headers.
- o1js is pinned to `2.2.0` to match the circuits and the oracle. Vite's build target is `esnext` for BigInt.
- The oracle URL comes from `store.state.settings.zkOracle`, which can be edited at runtime in the header settings. Endpoints are built as `zkOracle + 'path'`, and the base URL ends with `/`.
- Code style: Vue 3 `<script setup>` SFCs, plain JS, no semicolons, single quotes.
