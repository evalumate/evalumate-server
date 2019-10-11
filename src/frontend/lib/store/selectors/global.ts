// import { createSelector } from "reselect";
import { RootState } from "StoreTypes";

export const selectUserRole = (state: RootState) => state.global.userRole;
