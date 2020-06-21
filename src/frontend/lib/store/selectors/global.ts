import { RootState } from "StoreTypes";

export const selectUserRole = (state: RootState) => state.global.userRole;
export const selectSession = (state: RootState) => state.global.session;

export const selectSnackbarMessage = (state: RootState) => state.global.snackbar.message;
export const selectSnackbarVisible = (state: RootState) => state.global.snackbar.visible;

export const selectInfoDialogTitle = (state: RootState) => state.global.infoDialog.title;
export const selectInfoDialogMessage = (state: RootState) => state.global.infoDialog.message;
export const selectInfoDialogIsVisible = (state: RootState) => state.global.infoDialog.isVisible;
