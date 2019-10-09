import { createStandardAction } from "typesafe-actions";
import { Session } from "../../models/Session";

export const setSession = createStandardAction("Owner:setSession")<Session>();
