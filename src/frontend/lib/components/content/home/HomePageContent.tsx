import { Grid, Typography } from "@material-ui/core";
import * as React from "react";

import { CreateSessionForm } from "../../forms/CreateSessionForm";
import { JoinSessionForm } from "../../forms/JoinSessionForm";
import { Paper } from "../../layout/Paper";

export const HomePageContent: React.FunctionComponent = () => (
  <>
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
  </>
);
