import { RootState } from "StoreTypes";

export const selectMember = (state: RootState) => state.member.member;
export const selectUnderstanding = (state: RootState) => state.member.understanding;
