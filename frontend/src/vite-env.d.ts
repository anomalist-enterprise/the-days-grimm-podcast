/// <reference types="vite/client" />

interface ImportMetaEnv {
  // NOTE: Never declare private/vendor secrets here. Any VITE_-prefixed var is
  // inlined into the client bundle at build time. Keep keys (e.g. Printful)
  // server-side in a Pages Function/Worker secret and proxy calls through it.
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
