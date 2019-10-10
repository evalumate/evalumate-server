import rootReducer from "./reducers";
import { applyMiddleware, createStore, Reducer } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import { RootAction, RootState } from "StoreTypes";
// import thunkMiddleware from "redux-thunk";

// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/es/storage";

const createConfiguredStore = (reducer: Reducer<RootState>, initialState: RootState) =>
  createStore(reducer, initialState, composeWithDevTools(/*applyMiddleware(thunkMiddleware)*/));

export const makeStore = (initialState: RootState, { isServer }) => {
  if (isServer) {
    //@ts-ignore: How to get rid of the inferred never types in RootState? They would break the next line.
    return createConfiguredStore(rootReducer, initialState);
  } else {
    // Initialize redux-persist only on the client side
    const { persistStore, persistReducer } = require("redux-persist");
    const storage = require("redux-persist/es/storage").default;

    const persistConfig = {
      key: "evalumate",
      storage,
    };

    const persistedReducer = persistReducer(persistConfig, rootReducer);
    //@ts-ignore: How to get rid of the inferred never types in RootState? They would break the next line.
    const store = createConfiguredStore(persistedReducer, initialState);

    store.persistor = persistStore(store); // TODO add persistor to store type

    return store;
  }
};
