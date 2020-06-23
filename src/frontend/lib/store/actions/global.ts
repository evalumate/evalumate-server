import { createAction } from "typesafe-actions";

import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";

export const setUserRole = createAction("Global:UserRole:set")<UserRole>();
export const setSession = createAction("Global:Session:set")<Session>();
export const resetSession = createAction("Global:Session:reset")();

export const showSnackbar = createAction("Global:Snackbar:show")<string>();
export const resetSnackbar = createAction("Global:Snackbar:reset")();

export const showInfoDialog = createAction("Global:InfoDialog:show")<{
  title: string;
  message: string;
}>();
export const resetInfoDialog = createAction("Global:InfoDialog:reset")();
