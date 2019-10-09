import global from "./global";
import owner from "./owner";
import { combineReducers } from "redux";

// Export a root reducer that combines all the others
export default combineReducers({
  global,
  owner,
});
