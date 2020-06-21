import config from "config";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { keyBy, map, mapValues } from "lodash";
import pick from "lodash/pick";
import { MoreThan, getRepository } from "typeorm";

import Record from "../entities/Record";
import Session from "../entities/Session";
import BadRequestException from "../exceptions/BadRequestException";
import * as respond from "../utils/api-respond";
import { createLogger } from "../utils/logger";
import { getUnixTimestamp } from "../utils/time";
import Controller from "./Controller";
import SessionController from "./SessionController";

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
    this.router.get(
      this.path + "/after/:recordId",
      SessionController.mLoadSession,
      SessionController.mValidateSessionKey,
      this.mGetRecordsAfter
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

    // Calculate records
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

    if (recordData.length == 0) {
      logger.debug("No records had to be generated.");
      return;
    }

    const records: Record[] = [];
    for (const data of recordData) {
      records.push(Object.assign(new Record(), data));
    }

    // Retrieve the record ids
    const recordIds: {
      sessionId: number;
      nextRecordId: number;
    }[] = await Record.createQueryBuilder("record")
      .select("sessionId")
      .addSelect("COUNT(sessionId)", "nextRecordId")
      .groupBy("sessionId")
      .getRawMany();

    let sessionIdToRecordIdMap = mapValues(keyBy(recordIds, "sessionId"), "nextRecordId");

    for (const record of records) {
      record.id =
        record.sessionId in sessionIdToRecordIdMap ? sessionIdToRecordIdMap[record.sessionId] : 0;
    }

    await Record.getRepository().save(records);
    logger.debug("Finished generating records");
  }

  static getRecordsBySessionId(sessionId: string) {
    return Record.find({ where: { sessionId } });
  }

  /**
   * Returns all records of a specified session that have an id which is greater than `recordId`.
   *
   * @param sessionId The id of the session to return the records for
   * @param recordId The record id up to which no records will be selected
   *
   * @returns A (possibly empty) array of `Record` objects
   */
  static getRecordsBySessionIdAfter(sessionId: string, recordId: number) {
    return Record.find({
      where: { sessionId, id: MoreThan(recordId) },
    });
  }

  /**
   * Transforms an array of `Record` objects to an array of publicly exposable record objects.
   *
   * @param records The `Record` array to be transformed
   *
   * @returns An array of publicly exposable record objects, generated from the provided `records`
   *          array
   */
  private static pickExposableRecordAttributes(records: Record[]) {
    return map(records, (record) =>
      pick(record, [
        "id",
        "time",
        "registeredMembersCount",
        "activeMembersCount",
        "understandingMembersCount",
      ])
    );
  }

  private mGetRecords = async (req: Request, res: Response) => {
    const session = req.session!;
    const records = await RecordController.getRecordsBySessionId(session.id);
    respond.success(res, RecordController.pickExposableRecordAttributes(records));
  };

  private mGetRecordsAfter = asyncHandler(async (req: Request, res: Response) => {
    const session = req.session!;
    const recordId: string = req.params.recordId;

    if (!/^\d+$/.test(recordId)) {
      throw new BadRequestException(
        "The record id provided to the records/after/ route has to be a positive integer."
      );
    }

    const records = await RecordController.getRecordsBySessionIdAfter(
      session.id,
      parseInt(recordId)
    );
    respond.success(res, RecordController.pickExposableRecordAttributes(records));
  });

  async shutDown() {
    clearInterval(this.generateRecordsIntervalId);
    logger.debug("generateRecords interval was cleared");
  }
}
