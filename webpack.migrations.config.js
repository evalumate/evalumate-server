// https://typeorm.io/#/faq/bundling-migration-files

const nodeExternals = require("webpack-node-externals");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const glob = require("glob");
const path = require("path");

module.exports = {
  // Dynamically generate a `{ [name]: sourceFileName }` map for the `entry` option
  // change `src/db/migrations` to the relative path to your migration folder
  entry: glob.sync(path.resolve("./src/backend/migrations/*.ts")).reduce((entries, filename) => {
    const migrationName = path.basename(filename, ".ts");
    return Object.assign({}, entries, {
      [migrationName]: filename,
    });
  }, {}),
  output: {
    path: path.join(__dirname, "dist/backend/migrations"),
    libraryTarget: "umd",
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
  plugins: [new ForkTsCheckerWebpackPlugin({ typescript: { configFile: "./src/tsconfig.json" } })],
  optimization: {
    namedModules: true,
    minimize: false,
  },
};
