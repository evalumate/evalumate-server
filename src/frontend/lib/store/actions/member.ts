import { createAction } from "typesafe-actions";

import { Member } from "../../models/Member";

export const setMember = createAction("Member:setMember")<Member | null>();
export const setUnderstanding = createAction("Member:setUnderstanding")<boolean>();
