import master from "./master";
import { combineReducers } from "redux";

// Export a single reducer that combines all the others
export default combineReducers({
  master,
});
