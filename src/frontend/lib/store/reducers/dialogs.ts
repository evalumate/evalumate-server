import { createReducer } from "typesafe-actions";

import { resetInfoDialog, resetSnackbar, showInfoDialog, showSnackbar } from "../actions/dialogs";

export type DialogsState = Readonly<{
  /**
   * Snackbar
   */
  snackbar: {
    message: string;
    isVisible: boolean;
  };
  /**
   * Info dialog
   */
  infoDialog: {
    title: string;
    message: string;
    isVisible: boolean;
  };
}>;

const initialState: DialogsState = {
  snackbar: {
    message: "",
    isVisible: false,
  },
  infoDialog: {
    title: "",
    message: "",
    isVisible: false,
  },
};

const reducer = createReducer(initialState)
  // Snackbar
  .handleAction(showSnackbar, (state, action) => ({
    ...state,
    snackbar: {
      message: action.payload,
      isVisible: true,
    },
  }))
  .handleAction(resetSnackbar, (state) => ({
    ...state,
    snackbar: {
      message: "",
      isVisible: false,
    },
  }))
  // Info dialog
  .handleAction(showInfoDialog, (state, action) => ({
    ...state,
    infoDialog: {
      title: action.payload.title,
      message: action.payload.message,
      isVisible: true,
    },
  }))
  .handleAction(resetInfoDialog, (state) => ({
    ...state,
    infoDialog: {
      // Leaving the title and message in place so they do not disappear prior to dialog fadeout
      ...state.infoDialog,
      isVisible: false,
    },
  }));

export default reducer;
