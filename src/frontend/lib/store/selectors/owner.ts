// import { createSelector } from "reselect";
import { RootState } from "StoreTypes";

export const selectSession = (state: RootState) => state.owner.session;
