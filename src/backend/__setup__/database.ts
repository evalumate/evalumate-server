import { createConnection } from "typeorm";

import databaseConfig from "../ormconfig";

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
