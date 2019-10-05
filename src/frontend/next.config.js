const withPlugins = require("next-compose-plugins");
const withSass = require("@zeit/next-sass");

const configuration = {
  distDir: "../../dist/frontend",
  webpack: config => {
    // Webpack config could be modified here
    return config;
  },
};

module.exports = withPlugins([withSass], configuration);
