import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { setSession, setUserRole } from "../actions/global";
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
}>;

const initialState: GlobalState = {
  userRole: UserRole.Visitor,
  session: null,
};

const globalReducer = createReducer(initialState)
  .handleAction(setUserRole, (state, action) =>
    Object.assign({}, state, { userRole: action.payload })
  )
  .handleAction(setSession, (state, action) =>
    Object.assign({}, state, { session: action.payload })
  );

export default globalReducer;
