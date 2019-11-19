import { GlobalSnackbar } from "../lib/components/layout/GlobalSnackbar";
import { makeStore } from "../lib/store";
import theme from "../lib/theme";
import { redirectTo, getRedirectUrlIfApplicable } from "../lib/util/redirect";
import { CssBaseline } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import withReduxSaga from "next-redux-saga";
import withRedux from "next-redux-wrapper";
import NextApp, { AppContext } from "next/app";
import React from "react";
import { ModalProvider } from "react-modal-hook";
import { Provider } from "react-redux";
import { TransitionGroup } from "react-transition-group";

class App extends NextApp {
  static async getInitialProps({ Component, ctx }: AppContext) {
    const redirectDestination = await getRedirectUrlIfApplicable(
      (ctx as any).store,
      ctx.pathname,
      ctx.query
    );

    if (redirectDestination) {
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
