import { Record } from "../../models/Record";
import { createStandardAction } from "typesafe-actions";

export const setRecords = createStandardAction("Owner:setRecords")<Record[]>();
export const addRecords = createStandardAction("Owner:addRecords")<Record[]>();
