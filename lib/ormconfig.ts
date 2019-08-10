import config from "config";
import { ConnectionOptions } from "typeorm";

const databaseConfig: ConnectionOptions = {
  ...config.get("database"),
  entities: [__dirname + "/entities/*{.ts,.js}"],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  migrationsRun: true,
  // Only synchronize the database schema in a development environment
  synchronize: process.env.NODE_ENV === "development",
  cli: {
    entitiesDir: __dirname + "/entities",
    migrationsDir: __dirname + "/migrations",
  },
};

export default databaseConfig;
