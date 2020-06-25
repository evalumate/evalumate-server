import { Box, Grid, Typography } from "@material-ui/core";
import { NextPage } from "next";
import * as React from "react";

import { CreateSessionForm } from "../lib/components/forms/CreateSessionForm";
import { JoinSessionForm } from "../lib/components/forms/JoinSessionForm";
import { Page } from "../lib/components/layout/Page";
import { Paper } from "../lib/components/layout/Paper";
import { TitleSubtitleBox } from "../lib/components/layout/TitleSubtitleBox";
import { selectSession } from "../lib/store/selectors/session";
import { useTranslation } from "../lib/util/i18n";
import { redirectTo } from "../lib/util/redirect";

const HomePage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <Page title={"EvaluMate – " + t("title_suffix")} titleAddHomepageTitle={false} maxWidth="sm">
      <Grid item xs={12}>
        <TitleSubtitleBox />
      </Grid>
      <Grid item xs={12}>
        <Paper>
          <JoinSessionForm />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Paper>
          <CreateSessionForm />
        </Paper>
      </Grid>
    </Page>
  );
};

HomePage.getInitialProps = async ({ store, res }) => {
  const session = selectSession(store.getState());
  if (session !== null) {
    redirectTo(`/${session.id}`, res);
  }
  return {};
};

export default HomePage;
