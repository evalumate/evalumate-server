// Redux-store-related type definitions
declare module "StoreTypes" {
  import { StateType, ActionType } from "typesafe-actions";
  import { Store } from "redux";
  export type RootAction = ActionType<typeof import("./actions").default>;
  export type RootState = StateType<ReturnType<typeof import("./reducers").default>>;
  export type Store = Store<RootState, RootAction>;
}
