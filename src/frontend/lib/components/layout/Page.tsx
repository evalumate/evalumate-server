import { Menu } from "./Menu";
import theme from "../../theme";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Head from "next/head";
import * as React from "react";
import { MainGrid } from "./MainGrid";
import CssBaseline from "@material-ui/core/CssBaseline";

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
      </Head>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {!hideMenu && <Menu />}
        <MainGrid>{children}</MainGrid>
      </MuiThemeProvider>
    </div>
  );
};
