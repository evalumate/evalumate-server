import "./Page.scss";
import Head from "next/head";
import * as React from "react";

import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#4CAF50",
    },
  },
});

type PageProps = {
  hideMenu?: boolean;
  /**
   * The page title (will be set in the HTML <title> tag)
   */
  title?: string;
  /**
   * Whether or not to add " – EvaluMate" to the title.
   */
  titleAddHomepageTitle?: boolean;
};

export const Page: React.FunctionComponent<PageProps> = ({
  hideMenu = false,
  title = "",
  titleAddHomepageTitle = true,
  children,
}) => {
  return (
    <div id="page">
      <Head>
        <title>{title + (titleAddHomepageTitle ? " – EvaluMate" : "")}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <MuiThemeProvider theme={theme}>Test</MuiThemeProvider>
    </div>
  );
};
