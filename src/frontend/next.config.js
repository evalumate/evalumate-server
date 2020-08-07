const config = require("config"); // Server config access
const path = require("path");

const serverRuntimeConfig = {
  backendPort: config.get("backendPort"),
};

const publicRuntimeConfig = {
  publicBackendUrl: config.get("publicBackendUrl"),
  captchaSolutionLength: config.get("captcha.solutionLength"),
  sessionIdLength: config.get("session.idLength"),
  sessionNameMaxLength: config.get("session.nameMaxLength"),
  memberPingInterval: config.get("member.pingInterval"),
  recordInterval: config.get("record.interval"),
  historyScaleChangeInterval: config.get("client.historyScaleChangeInterval"),
};

module.exports = {
  distDir: "./dist",
  webpack(config, options) {
    // For i18next-hmr:
    if (!options.isServer && config.mode === "development") {
      const { I18NextHMRPlugin } = require("i18next-hmr/plugin");
      config.plugins.push(
        new I18NextHMRPlugin({
          localesDir: path.resolve(__dirname, "public/static/locales")
        })
      );
    }
    return config;
  },
  serverRuntimeConfig,
  publicRuntimeConfig,
};

module.exports.config = { serverRuntimeConfig, publicRuntimeConfig };
