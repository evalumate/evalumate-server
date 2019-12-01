// https://github.com/typeorm/typeorm/blob/master/docs/connection-options.md

import config from "config";
import { ConnectionOptions } from "typeorm";

// Import entities (they need to be imported in order to be included in the webpack bundle)
import CaptchaEntity from "./entities/Captcha";
import MemberEntity from "./entities/Member";
import RandomIdEntityEntity from "./entities/RandomIdEntity";
import RecordEntity from "./entities/Record";
import SessionEntity from "./entities/Session";

const prod = process.env.NODE_ENV === "production";

const databaseConfig: ConnectionOptions = {
  entities: [CaptchaEntity, MemberEntity, RandomIdEntityEntity, RecordEntity, SessionEntity],
  migrations: [
    // Production: Transpiled migration files; Development: Original migration files
    prod ? "dist/backend/migrations/*.js" : "src/backend/migrations/*.ts",
  ],
  ...config.get("database"),
};

export default databaseConfig;
