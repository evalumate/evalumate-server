import { LessThan, MoreThan } from "typeorm";

import { getUnixTimestamp } from "./time";

/**
 * A TypeORM query operator that checks whether a unix time stamp is "younger" than a given number
 * of seconds.
 *
 * @param seconds The maximum number of seconds a time stamp may be "old" in order for a row to be
 * selected.
 */
export const YoungerThan = (seconds: number) => MoreThan(getUnixTimestamp() - seconds);

/**
 * A TypeORM query operator that checks whether a unix time stamp is "older" than a given number of
 * seconds.
 *
 * @param seconds The minimum number of seconds a time stamp has to be "old" in order for a row to
 * be selected.
 */
export const OlderThan = (seconds: number) => LessThan(getUnixTimestamp() - seconds);
