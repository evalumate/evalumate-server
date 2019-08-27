const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = (env, argv) => {
  return {
    entry: {
      index: "./src/server/index.ts",
    },
    output: {
      path: path.join(__dirname, "dist/server"),
      publicPath: "/",
      filename: "[name].js",
    },
    target: "node",
    resolve: {
      extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".json"],
    },
    node: {
      // Need this when working with express, otherwise the build fails
      __dirname: false, // if you don't put this is, __dirname
      __filename: false, // and __filename return blank or /
    },
    externals: [nodeExternals()], // Need this to avoid error when working with Express
    module: {
      rules: [{ test: /\.(ts|js)x?$/, loader: "babel-loader", exclude: /node_modules/ }],
    },
    plugins: [new ForkTsCheckerWebpackPlugin()],
    optimization: { namedModules: true },
  };
};
