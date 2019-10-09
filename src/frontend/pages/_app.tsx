import React from "react";
import { Provider } from "react-redux";
import NextApp, { Container, AppInitialProps } from "next/app";
import withRedux from "next-redux-wrapper";
import { initStore } from "../lib/store";
import { Store } from "redux";

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
      <Container>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withRedux(initStore)(App);
