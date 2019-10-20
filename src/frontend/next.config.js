const withPlugins = require("next-compose-plugins");
const withCss = require("@zeit/next-css");
const config = require("config"); // Server config access

const configuration = {
  distDir: "../../dist/frontend",
  webpack: (config, options) => {
    return config;
  },
  serverRuntimeConfig: {
    port: config.get("port"),
  },
  publicRuntimeConfig: {
    captchaSolutionLength: config.get("captcha.solutionLength"),
    sessionIdLength: config.get("session.idLength"),
    sessionNameMaxLength: config.get("session.nameMaxLength"),
    memberPingInterval: config.get("client.memberPingInterval"),
  },
};

module.exports = withPlugins([withCss], configuration);
