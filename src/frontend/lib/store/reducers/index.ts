import { combineReducers } from "redux";

import dialogs from "./dialogs";
import session from "./session";

// Export a root reducer that combines all the others
export default combineReducers({
  dialogs,
  session,
});
