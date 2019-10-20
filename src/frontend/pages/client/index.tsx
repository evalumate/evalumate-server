import { JoinSessionForm } from "../../lib/components/forms/JoinSessionForm";
import { Page } from "../../lib/components/layout/Page";
import { Paper } from "../../lib/components/layout/Paper";
import { Grid, Container } from "@material-ui/core";
import { NextPage } from "next";
import * as React from "react";

const InitialMasterPage: NextPage = () => {
  return (
    <Page title="Join a session" maxWidth="xs">
      <Grid item xs={12}>
        <Paper>
          <JoinSessionForm />
        </Paper>
      </Grid>
    </Page>
  );
};

export default InitialMasterPage;
