import { makeStore } from "../lib/store";
import { redirectIfApplicable } from "../lib/util/redirect";
import withRedux from "next-redux-wrapper";
import NextApp, { AppContext } from "next/app";
import React from "react";
import { Provider } from "react-redux";

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
        <Component {...pageProps} />
      </Provider>
    );
  }
}

// @ts-ignore: Setting up TypeScript with next-redux-wrapper was too much of a hassle for too little
// value
export default withRedux(makeStore)(App);
