import { createReducer } from "typesafe-actions";

import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import {
  resetInfoDialog,
  resetSession,
  resetSnackbar,
  setSession,
  setUserRole,
  showInfoDialog,
  showSnackbar,
} from "../actions/global";

export type GlobalState = Readonly<{
  /**
   * The role of the app user
   */
  userRole: UserRole;
  /**
   * The session that the app is attached to (in client or master mode)
   */
  session: Readonly<Session> | null;
  /**
   * Global snackbar
   */
  snackbar: {
    message: string;
    visible: boolean;
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

const initialState: GlobalState = {
  userRole: UserRole.Visitor,
  session: null,
  snackbar: {
    message: "",
    visible: false,
  },
  infoDialog: {
    title: "",
    message: "",
    isVisible: false,
  },
};

const globalReducer = createReducer(initialState)
  // UserRole
  .handleAction(setUserRole, (state, action) => ({
    ...state,
    userRole: action.payload,
  }))
  // Session
  .handleAction(setSession, (state, action) => ({
    ...state,
    session: action.payload,
  }))
  .handleAction(resetSession, (state) => ({
    ...state,
    session: null,
  }))
  // Snackbar
  .handleAction(showSnackbar, (state, action) => ({
    ...state,
    snackbar: {
      message: action.payload,
      visible: true,
    },
  }))
  .handleAction(resetSnackbar, (state, action) => ({
    ...state,
    snackbar: {
      message: "",
      visible: false,
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
  .handleAction(resetInfoDialog, (state, action) => ({
    ...state,
    infoDialog: {
      // Leaving the title and message in place so they do not disappear prior to dialog fadeout
      ...state.infoDialog,
      isVisible: false,
    },
  }));

export default globalReducer;
