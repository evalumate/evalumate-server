module.exports = (env, argv) => {
  switch (argv.mode) {
    case "development":
      return require("./webpack.dev.config.js");
    case "production":
      return require("./webpack.prod.config.js");
  }
};
