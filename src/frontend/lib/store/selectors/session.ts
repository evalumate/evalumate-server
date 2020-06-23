import { RootState } from "StoreTypes";

export const selectMember = (state: RootState) => {
  if (state.session.member) {
    const { isUnderstanding, ...plainMember } = state.session.member;
    return plainMember;
  }
};
export const selectIsUnderstanding = (state: RootState) => !!state.session.member?.isUnderstanding;

export const selectUserRole = (state: RootState) => state.session.userRole;
export const selectSession = (state: RootState) => state.session.session;
