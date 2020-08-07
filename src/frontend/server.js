// Next.js development server with API reverse proxy and i18next-hmr

const express = require('express')
const next = require('next')
const config = require("config")
const { createProxyMiddleware } = require("http-proxy-middleware")

const app = next({ dev: true })
const handle = app.getRequestHandler()

const i18n = require('./lib/util/i18n').i18n;
const { applyServerHMR } = require('i18next-hmr/server');
applyServerHMR(i18n);

const port = process.env.PORT || 3000;

(async () => {
  await app.prepare()
  const server = express()

  // Proxy API in development mode
  server.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${config.get("backendPort")}/`,
      changeOrigin: true,
    }),
  );

  server.use(handle)
  
  await server.listen(port)
  console.log(`> Ready on http://localhost:${port}`);
})();