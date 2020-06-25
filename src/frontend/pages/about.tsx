import { Grid, Typography } from "@material-ui/core";
import { NextPage } from "next";
import * as React from "react";

import { Page } from "../lib/components/layout/Page";
import { TitleSubtitleBox } from "../lib/components/layout/TitleSubtitleBox";
import { useTranslation } from "../lib/util/i18n";

const AboutPage: NextPage<{}, void> = () => {
  const { t } = useTranslation(["about"]);

  return (
    <Page title="About">
      <Grid item xs={12}>
        <TitleSubtitleBox />
      </Grid>
      <Grid item xs={12}>
        <hr />
      </Grid>
      <Grid item xs={12} container justify="center">
        <Typography>
          <div
            dangerouslySetInnerHTML={{
              __html: t("problem_text", {
                interpolation: { escapeValue: false },
              }),
            }}
          />
          <br />
          <div
            dangerouslySetInnerHTML={{
              __html: t("solution_text", {
                interpolation: { escapeValue: false },
              }),
            }}
          />
          <br />
          <div
            dangerouslySetInnerHTML={{
              __html: t("advantage_text", {
                interpolation: { escapeValue: false },
              }),
            }}
          />
          <br />
          <center>
            <i>Button design in progress...</i>
          </center>
          <br />
          <br />
        </Typography>
      </Grid>
    </Page>
  );
};

export default AboutPage;
