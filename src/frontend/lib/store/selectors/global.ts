import { RootState } from "StoreTypes";

export const selectUserRole = (state: RootState) => state.global.userRole;
export const selectSession = (state: RootState) => state.global.session;
