// This file does not use TypeScript as setting it up with next-redux-wrapper was too much of a
// hassle for too little value

import { makeStore } from "../lib/store";
import { redirectIfApplicable } from "../lib/util/redirect";
import withRedux from "next-redux-wrapper";
import NextApp from "next/app";
import React from "react";
import { Provider } from "react-redux";

class App extends NextApp {
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
