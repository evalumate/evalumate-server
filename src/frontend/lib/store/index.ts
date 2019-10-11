import rootReducer from "./reducers";
import { createStore } from "redux";
import { RootState } from "StoreTypes";

export const makeStore = (initialState: RootState, { isServer, req = null }) => {
  if (isServer) {
    if (req) {
      // An express middleware has already created a redux store with the client state for us. We
      // can't do this here because it is asynchronous.
      return req.reduxStore;
    }

    // While the above store is present during getInitialProps, another store has to be provided for
    // SSR (which is when this function is called without a request object).
    //
    // Note: Changes made to the store during rendering will be lost, since the client state is
    // taken from a page's getInitialProps.

    return createStore(rootReducer, initialState);
  } else {
    // Initialize redux-persist only on the client side
    const { persistStore, persistReducer } = require("redux-persist");
    const { CookieStorage } = require("redux-persist-cookie-storage");
    const Cookies = require("cookies-js");

    const persistConfig = {
      key: "evalumate",
      storage: new CookieStorage(Cookies),
      stateReconciler(inboundState: any, originalState: any) {
        // Ignore state from cookies, only use the state passed to makeStore (which is the state
        // returned from `getInitialProps` by next-redux-wrapper). Reason: A page could change the
        // state of the server-side redux store in `getInitialProps` and we want the cookie state to
        // be fully updated to the server-altered state.
        return originalState;
      },
    };

    const { composeWithDevTools } = require("redux-devtools-extension/logOnlyInProduction");

    const reducer = persistReducer(persistConfig, rootReducer);
    console.log(initialState);
    const store = createStore(reducer, initialState, composeWithDevTools());

    // Since a store with the current state is present during SSR, we do not need a persist Gate.
    // Hence, we do not have to keep a reference to the persistor.
    persistStore(store);

    return store;
  }
};
