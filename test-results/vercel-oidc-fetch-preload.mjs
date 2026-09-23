/**
 * Minimal Preview Deployment Protection adapter for QA Evidence.
 * Activates only when VERCEL_OIDC_TOKEN is set (e.g. via `vercel env run`).
 * Does not change product code / EXPECTED / thresholds.
 */
const token = process.env.VERCEL_OIDC_TOKEN;
if (token && typeof globalThis.fetch === 'function') {
  const orig = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (!headers.has('x-vercel-trusted-oidc-idp-token')) {
      headers.set('x-vercel-trusted-oidc-idp-token', token);
    }
    return orig(input, { ...init, headers });
  };
}
