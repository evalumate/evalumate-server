import getConfig from "next/config";

const { publicRuntimeConfig, serverRuntimeConfig } = getConfig();

/**
 * Returns the URL of a specified API endpoint. On the client side, it is relative to
 * `serverRuntimeConfig.publicBackendUrl`. On the server side, it is relative to http://localhost
 * and the backend's port.
 *
 * @param endpoint The API-root-relative path (without leading slash) of an endpoint for which the
 * URL should be returned. If omitted, the API root URL will be returned.
 */
export function getApiUrl(endpoint: string = "") {
  const prefix = process.browser
    ? publicRuntimeConfig.publicBackendUrl
    : `http://localhost:${serverRuntimeConfig.backendPort}/api`;
  return `${prefix}/${endpoint}`;
}
