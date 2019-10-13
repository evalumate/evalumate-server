import { makeStore } from "../lib/store";
import { redirectIfApplicable } from "../lib/util/redirect";
import withRedux from "next-redux-wrapper";
import NextApp, { AppInitialProps } from "next/app";
import React from "react";
import { Provider } from "react-redux";
import { Store } from "StoreTypes";

type AppProps = AppInitialProps & { store: Store };

class App extends NextApp<AppProps> {
  static async getInitialProps({ Component, ctx }) {
    redirectIfApplicable(ctx.store, ctx.pathname, ctx.res);
    return {
      pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {},
    };
  }

  render() {
    const { Component, pageProps, store } = this.props;

    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default withRedux(makeStore)(App);
