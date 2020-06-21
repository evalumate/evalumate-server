import { combineReducers } from "redux";

import global from "./global";
import member from "./member";
import owner from "./owner";

// Export a root reducer that combines all the others
export default combineReducers({
  global,
  owner,
  member,
});
