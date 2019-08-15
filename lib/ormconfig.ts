import config from "config";
import { ConnectionOptions } from "typeorm";

const databaseConfig: ConnectionOptions = {
  ...config.get("database"),
  entities: [__dirname + "/entities/*{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  cli: {
    entitiesDir: __dirname + "/entities",
    migrationsDir: __dirname + "/migrations",
  },
};

export default databaseConfig;
