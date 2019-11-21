import { GlobalSnackbar } from "../lib/components/layout/GlobalSnackbar";
import { makeStore } from "../lib/store";
import { sharedPersistConfig } from "../lib/store/persist.config";
import rootReducer from "../lib/store/reducers";
import theme from "../lib/theme";
import { getRedirectUrlIfApplicable, redirectTo } from "../lib/util/redirect";
import { CssBaseline } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import withReduxSaga from "next-redux-saga";
import withRedux from "next-redux-wrapper";
import NextApp, { AppContext } from "next/app";
import React from "react";
import { ModalProvider } from "react-modal-hook";
import { Provider } from "react-redux";
import { TransitionGroup } from "react-transition-group";
import { createStore } from "redux";
import { Persistor, persistReducer, persistStore } from "redux-persist";

class App extends NextApp {
  static async getInitialProps({ Component, ctx }: AppContext) {
    const redirectDestination = await getRedirectUrlIfApplicable(
      (ctx as any).store,
      ctx.pathname,
      ctx.query
    );

    if (redirectDestination) {
      if ((ctx as any).isServer) {
        // Persist the store to cookies (sent with the redirect)
        const Cookies = require("cookies");
        const { CookieStorage, NodeCookiesWrapper } = require("redux-persist-cookie-storage");

        const cookieJar = new NodeCookiesWrapper(new Cookies(ctx.req!, ctx.res!));
        const persistConfig = {
          ...sharedPersistConfig,
          blacklist: sharedPersistConfig.blacklist.concat("_persist"),
          storage: new CookieStorage(cookieJar, {
            setCookieOptions: {
              httpOnly: false, // Allow modifications on the client side
            },
          }),
          stateReconciler(inboundState: any, originalState: any) {
            // Ignore state from cookies, only use the store's current state
            return originalState;
          },
        };

        const reducer = persistReducer(persistConfig, rootReducer);
        const store = createStore(reducer, (ctx as any).store.getState());
        const persistor: Persistor = await new Promise(resolve => {
          const persistor = persistStore(store, {}, () => {
            resolve(persistor);
          });
        });

        // Set cookies
        await persistor.flush();
      }

      redirectTo(redirectDestination, ctx.res);
    }

    return {
      pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {},
    };
  }

  render() {
    const { Component, pageProps, store } = this.props as any;

    return (
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <ModalProvider container={TransitionGroup}>
            <Component {...pageProps} />
          </ModalProvider>
          <GlobalSnackbar />
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default withRedux(makeStore)(withReduxSaga(App));
