import { Grid, Typography } from "@material-ui/core";
import { NextPage } from "next";
import * as React from "react";

import { Page } from "../lib/components/layout/Page";

const AboutPage: NextPage<{}, void> = () => {
  return (
    <Page title="About">
      <Grid item xs={12} container justify="center">
        <Typography>Coming soon</Typography>
      </Grid>
    </Page>
  );
};

export default AboutPage;
