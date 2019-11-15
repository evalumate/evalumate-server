import { GlobalSnackbar } from "../lib/components/layout/GlobalSnackbar";
import { makeStore } from "../lib/store";
import theme from "../lib/theme";
import { redirectIfApplicable } from "../lib/util/redirect";
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
    // @ts-ignore: TypeScript does not know about the redux store from next-redux-wrapper
    redirectIfApplicable(ctx.store, ctx.pathname, ctx.res);
    return {
      pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {},
    };
  }

  render() {
    // @ts-ignore: TypeScript does not know about the redux store from next-redux-wrapper
    const { Component, pageProps, store } = this.props;

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

// @ts-ignore: Setting up TypeScript with next-redux-wrapper was too much of a hassle for too little
// value
export default withRedux(makeStore)(withReduxSaga(App));
