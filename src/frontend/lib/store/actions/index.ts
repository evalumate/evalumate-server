import * as GlobalActions from "./global";
import * as MemberActions from "./member";
import * as OwnerActions from "./owner";

// Export all actions for usage in type definitions
export default {
  global: GlobalActions,
  owner: OwnerActions,
  member: MemberActions,
};
