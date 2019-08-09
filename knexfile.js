const config = require("config");

module.exports = {
  client: config.get("database.client"),
  connection: config.get("database.connection"),
  useNullAsDefault: true,
  migrations: {
    directory: "lib/db/migrations",
    extension: process.env.NODE_ENV === "production" ? "js" : ".ts",
    loadExtensions: process.env.NODE_ENV === "production" ? ["js"] : [".ts"],
  },
};
