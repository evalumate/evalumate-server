import { Record } from "../../models/Record";
import { createAction } from "typesafe-actions";

export const setRecords = createAction("Owner:setRecords")<Record[]>();
export const addRecords = createAction("Owner:addRecords")<Record[]>();
