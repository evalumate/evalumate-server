import { Grid, Typography } from "@material-ui/core";
import { NextPage } from "next";
import * as React from "react";

import { CreateSessionForm } from "../lib/components/forms/CreateSessionForm";
import { JoinSessionForm } from "../lib/components/forms/JoinSessionForm";
import { Page } from "../lib/components/layout/Page";
import { Paper } from "../lib/components/layout/Paper";
import { selectSession } from "../lib/store/selectors/global";
import { redirectTo } from "../lib/util/redirect";

const HomePage: NextPage = () => {
  return (
    <Page title="EvaluMate – Feedback Made Easy" titleAddHomepageTitle={false} maxWidth="sm">
      <Grid item xs={12}>
        <Typography style={{ flexGrow: 1 }} align="center">
          <Typography variant="h3" component="h1">
            Evaluate? EvaluMate!
          </Typography>
          <Typography variant="subtitle1">A social project by students, for students.</Typography>
        </Typography>
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
};

export default HomePage;
