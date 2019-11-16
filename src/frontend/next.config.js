const withPlugins = require("next-compose-plugins");
const config = require("config"); // Server config access

const serverRuntimeConfig = {
  port: config.get("port"),
};

const publicRuntimeConfig = {
  captchaSolutionLength: config.get("captcha.solutionLength"),
  sessionIdLength: config.get("session.idLength"),
  sessionNameMaxLength: config.get("session.nameMaxLength"),
  memberPingInterval: config.get("member.pingInterval"),
  recordInterval: config.get("record.interval"),
  historyScaleChangeInterval: config.get("client.historyScaleChangeInterval"),
};

const configuration = {
  distDir: "../../dist/frontend",
  webpack: (config, options) => {
    return config;
  },
  serverRuntimeConfig,
  publicRuntimeConfig,
};

module.exports = withPlugins([], configuration);
module.exports.config = { serverRuntimeConfig, publicRuntimeConfig };
