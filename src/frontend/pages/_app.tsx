import { CssBaseline } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { withReduxCookiePersist } from "next-redux-cookie-wrapper";
import { ReduxWrapperAppProps } from "next-redux-wrapper";
import NextApp, { AppContext } from "next/app";
import * as React from "react";
import { ModalProvider } from "react-modal-hook";
import { Provider } from "react-redux";
import { TransitionGroup } from "react-transition-group";

import { GlobalInfoDialog } from "../lib/components/layout/dialogs/GlobalInfoDialog";
import { GlobalSnackbar } from "../lib/components/layout/GlobalSnackbar";
import { makeStore } from "../lib/store";
import theme from "../lib/theme";
import { appWithTranslation } from "../lib/util/i18n";

class App extends NextApp<ReduxWrapperAppProps> {
  static async getInitialProps({ Component, ctx }: AppContext) {
    return {
      pageProps: Component.getInitialProps ? await Component.getInitialProps(ctx) : {},
    };
  }

  render() {
    const { Component, pageProps, store } = this.props;

    return (
      <Provider store={store}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <ModalProvider rootComponent={TransitionGroup}>
            <Component {...pageProps} />
          </ModalProvider>
          <GlobalSnackbar />
          <GlobalInfoDialog />
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default withReduxCookiePersist(makeStore)(appWithTranslation(App));
