import global from "./global";
import owner from "./owner";
import member from "./member";
import { combineReducers } from "redux";

// Export a root reducer that combines all the others
export default combineReducers({
  global,
  owner,
  member,
});
