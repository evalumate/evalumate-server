import { CreateSessionForm } from "../../lib/components/forms/CreateSessionForm";
import { Page } from "../../lib/components/layout/Page";
import { Paper } from "../../lib/components/layout/Paper";
import { Grid } from "@material-ui/core";
import { NextPage } from "next";
import * as React from "react";

const InitialMasterPage: NextPage = () => {
  return (
    <Page title="Create a session" maxWidth="sm">
      <Grid item xs={12}>
        <Paper>
          <CreateSessionForm />
        </Paper>
      </Grid>
      {/* <Grid item xs={12} md={6}>
        <Paper>
          Attach to an existing session 
        </Paper>
      </Grid> */}
    </Page>
  );
};

export default InitialMasterPage;
