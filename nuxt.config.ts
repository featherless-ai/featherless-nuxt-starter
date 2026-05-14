export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/main.css'],
  // Nitro reads FEATHERLESS_* env vars at request time via useRuntimeConfig().
  // No client-side bundling — these never reach the browser.
  runtimeConfig: {
    featherlessApiKey: process.env.FEATHERLESS_API_KEY ?? '',
    featherlessApiBaseUrl: process.env.FEATHERLESS_API_BASE_URL ?? 'https://api.featherless.ai/v1',
    featherlessModel: process.env.FEATHERLESS_MODEL ?? 'zai-org/GLM-5.1',
    public: {
      // Only what's safe to ship to the browser. The model name is fine; key/baseUrl are not.
      defaultModel: process.env.FEATHERLESS_MODEL ?? 'zai-org/GLM-5.1',
    },
  },
});
