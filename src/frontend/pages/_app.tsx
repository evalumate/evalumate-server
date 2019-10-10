import React from "react";
import { Provider } from "react-redux";
import NextApp, { AppInitialProps } from "next/app";
import withRedux from "next-redux-wrapper";
import { makeStore } from "../lib/store";
import { Store } from "redux";
import { PersistGate } from "redux-persist/integration/react";
import { REHYDRATE } from "redux-persist";

type AppProps = AppInitialProps & { store: Store };

class App extends NextApp<AppProps> {
  static async getInitialProps({ Component, ctx }) {
    return {
      pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {},
    };
  }

  render() {
    const { Component, pageProps, store } = this.props;

    return (
      <Provider store={store}>
        <PersistGate persistor={store.persistor} loading={<div>Loading</div>}>
          <Component {...pageProps} />
        </PersistGate>
      </Provider>
    );
  }
}

export default withRedux(makeStore)(App);
