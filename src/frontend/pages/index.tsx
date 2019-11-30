import { JoinSessionForm } from "../lib/components/forms/JoinSessionForm";
import { Page } from "../lib/components/layout/Page";
import { Paper } from "../lib/components/layout/Paper";
import { Grid, Typography } from "@material-ui/core";
import { NextPage } from "next";
import * as React from "react";
import { CreateSessionForm } from "../lib/components/forms/CreateSessionForm";

const HomePage: NextPage<{}, void> = () => {
  return (
    <Page
      title="EvaluMate (Alpha) – Feedback Made Easy"
      titleAddHomepageTitle={false}
      maxWidth="sm"
    >
      <Grid item xs={12}>
        <Paper>
          <JoinSessionForm />
        </Paper>
      </Grid>
      <Grid item xs={12} container justify="center">
        <Typography>or</Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper>
          <CreateSessionForm />
        </Paper>
      </Grid>
    </Page>
  );
};

export default HomePage;
