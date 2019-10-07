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
    captchaSolutionLength: config.get("captchas.solutionLength"),
    sessionIdLength: config.get("ids.sessionIdLength"),
    sessionNameMaxLength: config.get("sessionNameMaxLength"),
  },
};

module.exports = withPlugins([withCss], configuration);
