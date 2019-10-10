// Redux-store-related type definitions
declare module "StoreTypes" {
  import { StateType, ActionType } from "typesafe-actions";
  export type Store = StateType<typeof import("./index").default>;
  export type RootAction = ActionType<typeof import("./actions").default>;
  export type RootState = StateType<ReturnType<typeof import("./reducers").default>>;
}

// Add optional persistor property to redux Store interface
declare global {
  declare module "redux" {
    import { Persistor } from "redux-persist/lib/types";

    interface Store {
      persistor?: Persistor;
    }
  }
}
