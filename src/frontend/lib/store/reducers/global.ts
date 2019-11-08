import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { resetSnackbar, setSession, setUserRole, showSnackbar } from "../actions/global";
import { createReducer } from "typesafe-actions";

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
   * Information related to the global snackbar
   */
  snackbar: {
    message: string;
    visible: boolean;
  };
}>;

const initialState: GlobalState = {
  userRole: UserRole.Visitor,
  session: null,
  snackbar: {
    message: "",
    visible: false,
  },
};

const globalReducer = createReducer(initialState)
  .handleAction(setUserRole, (state, action) => ({
    ...state,
    userRole: action.payload,
  }))
  .handleAction(setSession, (state, action) => ({
    ...state,
    session: action.payload,
  }))
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
  }));

export default globalReducer;
