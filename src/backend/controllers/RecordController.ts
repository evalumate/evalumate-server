import Controller from "./Controller";
import SessionController from "./SessionController";
import Record from "../entities/Record";
import Session from "../entities/Session";
import validationMiddleware from "../middlewares/validation";
import * as respond from "../utils/api-respond";
import { createLogger } from "../utils/logger";
import { getUnixTimestamp } from "../utils/time";
import config from "config";
import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import HttpStatus from "http-status-codes";
import pick from "lodash/pick";
import { getConnection, getRepository } from "typeorm";

const logger = createLogger(module);

export const memberActiveTimeout: number = config.get("member.activeTimeout");
export const recordInterval: number = config.get("record.interval");

export default class RecordController extends Controller {
  private generateRecordsIntervalId: number;

  constructor() {
    super("/sessions/:sessionId/records");
    this.initializeRoutes();
    this.generateRecordsIntervalId = setInterval(
      RecordController.generateRecords,
      recordInterval * 1000,
      memberActiveTimeout
    );
  }

  initializeRoutes() {
    this.router.get(
      this.path + "",
      SessionController.mLoadSession,
      SessionController.mValidateSessionKey,
      this.mGetRecords
    );
  }

  /**
   * Generates a new record for each session in the database.
   *
   * @param activeDuration The duration (in seconds) that may have passed since a member ping and
   *                       the call of this method such that the member is considered active.
   */
  private static async generateRecords(activeDuration: number): Promise<void> {
    logger.debug("Generating records");

    const recordData = await getRepository(Session)
      .createQueryBuilder("session")
      .leftJoin("session.members", "member")
      .select("session.id", "sessionId")
      .addSelect("COUNT(member.id)", "registeredMembersCount")
      .addSelect(
        "SUM(CASE WHEN member.lastPingTime >= :earliestConsideredTime THEN 1 ELSE 0 END)",
        "activeMembersCount"
      )
      .addSelect(
        "SUM(CASE WHEN member.lastPingTime >= :earliestConsideredTime THEN member.understanding ELSE 0 END)",
        "understandingMembersCount"
      )
      .setParameter("earliestConsideredTime", getUnixTimestamp() - activeDuration)
      .groupBy("session.id")
      .getRawMany();

    const records: Record[] = [];
    for (const data of recordData) {
      records.push(Object.assign(new Record(), data));
    }

    await getRepository(Record).save(records);
    logger.debug("Finished generating records");
  }

  static async getRecordsBySessionId(sessionId: string) {
    const records = await getRepository(Record).find({ where: { sessionId } });
    return records;
  }

  private mGetRecords = async (req: Request, res: Response) => {
    // TODO
  };

  async shutDown() {
    clearInterval(this.generateRecordsIntervalId);
    logger.debug("generateRecords interval was cleared");
  }
}
