import { createAction } from "typesafe-actions";

import { Record } from "../../models/Record";

export const setRecords = createAction("Owner:setRecords")<Record[]>();
export const addRecords = createAction("Owner:addRecords")<Record[]>();
