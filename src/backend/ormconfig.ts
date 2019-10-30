import config from "config";
import { ConnectionOptions } from "typeorm";

const databaseConfig: ConnectionOptions = {
  entities: [__dirname + "/entities/*.ts"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  cli: {
    entitiesDir: __dirname + "/entities",
    migrationsDir: __dirname + "/migrations",
  },
  ...config.get("database"),
};

export default databaseConfig;
