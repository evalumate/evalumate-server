import * as GlobalActions from "./global";
import * as OwnerActions from "./owner";
import * as MemberActions from "./member";

// Export all actions for usage in type definitions
export default {
  global: GlobalActions,
  owner: OwnerActions,
  member: MemberActions,
};
