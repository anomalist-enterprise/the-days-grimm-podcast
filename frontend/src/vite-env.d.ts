/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Printful API calls are proxied through the backend; no VITE_ secret needed here.
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
