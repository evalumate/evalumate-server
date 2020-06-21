import { createAction } from "typesafe-actions";

import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";

export const setUserRole = createAction("Global:setUserRole")<UserRole>();
export const setSession = createAction("Global:setSession")<Session | null>();

export const showSnackbar = createAction("Global:Snackbar:show")<string>();
export const resetSnackbar = createAction("Global:Snackbar:reset")();
