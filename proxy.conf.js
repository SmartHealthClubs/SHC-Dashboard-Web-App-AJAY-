// Angular's dev-server (@angular/build:dev-server) runs on Vite under the
// hood and passes this file straight through to Vite's `server.proxy` option
// — same shape as the React app's vite.config.ts, so this is a direct port
// of that proxy, not a reimplementation. See docs/HANDOFF-NOTES.md /
// SHC_Dashboard_HANDOFF.md for the "__APP_UPDATE_REQUIRED" blocker this
// header set was hard-won to fix; do not regress it.
//
// Auth/device headers and the fitnessCenterId query param are injected here,
// server-side, in Node — never in client code or an HttpInterceptor — so the
// token can never reach the browser bundle.
const dotenv = require('dotenv');
dotenv.config();

// Note the "-wa" — this host matches our fitness centre. Easy to mistype
// against the similarly-named staging-cir.smarthealthclubs.com.
const API_TARGET = 'https://staging-cir-wa.smarthealthclubs.com/v2';

const API_BASIC_AUTH = process.env['API_BASIC_AUTH'];
const FITNESS_CENTER_ID = process.env['FITNESS_CENTER_ID'];

if (!API_BASIC_AUTH) {
  console.warn(
    '[api-proxy] API_BASIC_AUTH is not set in .env — requests to the API proxy will be sent without an Authorization header.'
  );
}
if (!FITNESS_CENTER_ID) {
  console.warn('[api-proxy] FITNESS_CENTER_ID is not set in .env — requests will be sent without it.');
}

module.exports = {
  '/api': {
    target: API_TARGET,
    changeOrigin: true,
    secure: true,
    // Widgets never need to know the fitness centre id themselves — it's
    // injected here from .env, same as the auth/device headers below, so it
    // stays out of client code and versioned source.
    rewrite: (requestPath) => {
      const withoutPrefix = requestPath.replace(/^\/api/, '');
      if (!FITNESS_CENTER_ID) return withoutPrefix;
      const url = new URL(withoutPrefix, 'http://internal');
      url.searchParams.set('fitnessCenterId', FITNESS_CENTER_ID);
      return `${url.pathname}${url.search}`;
    },
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Authorization', `Basic ${API_BASIC_AUTH ?? ''}`);
        proxyReq.setHeader('accept', 'application/json');
        proxyReq.setHeader('X-Device', 'external-api-access');
        proxyReq.setHeader('X-Device-Api-Version', '79');
      });
    },
  },
};
