/// <reference types="vite/client" />

interface ImportMetaEnv {
  // TheSportsDB API key. Optional: the free test key is used when it is unset.
  readonly VITE_SPORTSDB_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
