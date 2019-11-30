import { GlobalSnackbar } from "../lib/components/layout/GlobalSnackbar";
import { makeStore } from "../lib/store";
import theme from "../lib/theme";
import { getRedirectUrlIfApplicable, redirectTo } from "../lib/util/redirect";
import { CssBaseline } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import withReduxSaga from "next-redux-saga";
import NextApp, { AppContext } from "next/app";
import * as React from "react";
import { ModalProvider } from "react-modal-hook";
import { Provider } from "react-redux";
import { TransitionGroup } from "react-transition-group";
import { withReduxCookiePersist } from "next-redux-cookie-wrapper";

class App extends NextApp {
  static async getInitialProps({ Component, ctx }: AppContext) {
    const redirectDestination = await getRedirectUrlIfApplicable(
      ctx.store,
      ctx.pathname,
      ctx.query
    );

    if (redirectDestination) {
      if (ctx.req) {
        // Persist the store's state by setting a cookie header (sent with the redirect)
        await ctx.flushReduxStateToCookies();
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

export default withReduxCookiePersist(makeStore, {
  persistConfig: { blacklist: ["owner"] },
})(withReduxSaga(App));
