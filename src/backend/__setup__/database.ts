import databaseConfig from "../ormconfig";
import { createConnection } from "typeorm";

export const connectToGlobalDatabase = () => {
  return createConnection(databaseConfig);
};

export const connectToInMemoryDatabase = () => {
  return createConnection({
    type: "sqljs",
    dropSchema: true,
    synchronize: true,
    entities: databaseConfig.entities,
    logging: false,
  });
};
