import config from "config";
import { ConnectionOptions } from "typeorm";

const databaseConfig: ConnectionOptions = {
  ...config.get("database"),
  entities: [__dirname + "/db/entities/*{.ts,.js}"],
  migrations: ["/db/migrations/*{.ts,.js}"],
  migrationsRun: true,
  // Only synchronize the database schema in a development environment
  synchronize: process.env.NODE_ENV === "development",
  cli: {
    migrationsDir: __dirname + "/db/migrations",
  },
};

export default databaseConfig;
