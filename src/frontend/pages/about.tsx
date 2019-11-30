import { Page } from "../lib/components/layout/Page";
import { NextPage } from "next";
import * as React from "react";
import { Typography, Grid } from "@material-ui/core";

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
