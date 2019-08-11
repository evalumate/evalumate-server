// Temporary solution from
// https://github.com/typeorm/typeorm/issues/2286#issuecomment-499764915
import { MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual } from "typeorm";
import { format } from "date-fns";

// TypeORM query operators polyfills
enum EDateType {
  Date = "YYYY-MM-DD",
  Datetime = "YYYY-MM-DD HH:MM:SS",
}

const MoreThanDate = (date: Date, type: EDateType) =>
  MoreThan(format(date, type));
const MoreThanOrEqualDate = (date: Date, type: EDateType) =>
  MoreThanOrEqual(format(date, type));
const LessThanDate = (date: Date, type: EDateType) =>
  LessThan(format(date, type));
const LessThanOrEqualDate = (date: Date, type: EDateType) =>
  LessThanOrEqual(format(date, type));

export {
  MoreThanDate,
  MoreThanOrEqualDate,
  LessThanDate,
  LessThanOrEqualDate,
  EDateType,
};
