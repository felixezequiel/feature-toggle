/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_UNLEASH_URL: string
    readonly VITE_UNLEASH_APP_NAME: string
    readonly VITE_UNLEASH_ENVIRONMENT: string
    readonly VITE_UNLEASH_CLIENT_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
