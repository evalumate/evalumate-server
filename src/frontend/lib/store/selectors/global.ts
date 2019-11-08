import { RootState } from "StoreTypes";

export const selectUserRole = (state: RootState) => state.global.userRole;
export const selectSession = (state: RootState) => state.global.session;

export const selectSnackbarMessage = (state: RootState) => state.global.snackbar.message;
export const selectSnackbarVisible = (state: RootState) => state.global.snackbar.visible;
