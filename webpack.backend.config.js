const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/backend/index.ts",
  },
  output: {
    path: path.join(__dirname, "dist/backend"),
    publicPath: "/",
    filename: "[name].js",
  },
  target: "node",
  mode: "production",
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  node: {
    // Need this when working with express, otherwise the build fails
    __dirname: false, // if you don't put this is, __dirname
    __filename: false, // and __filename return blank or /
  },
  externals: [nodeExternals()],
  module: {
    rules: [{ test: /\.(ts|js)x?$/, loader: "babel-loader", exclude: /node_modules/ }],
  },
  plugins: [new ForkTsCheckerWebpackPlugin({ tsconfig: "./src/tsconfig.json" })],
  optimization: {
    namedModules: true,
  },
};
