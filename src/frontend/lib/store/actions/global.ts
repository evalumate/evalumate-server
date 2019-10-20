import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { createStandardAction } from "typesafe-actions";

export const setUserRole = createStandardAction("Global:setUserRole")<UserRole>();
export const setSession = createStandardAction("Global:setSession")<Session | null>();
