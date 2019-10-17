import { Member } from "../../models/Member";
import { createStandardAction } from "typesafe-actions";

export const setMember = createStandardAction("Member:setMember")<Member>();
export const setUnderstanding = createStandardAction("Member:setUnderstanding")<boolean>();
