import { createStandardAction } from "typesafe-actions";
import { UserRole } from "../reducers/global";

export const setUserRole = createStandardAction("Global:setUserRole")<UserRole>();
