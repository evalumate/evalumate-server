import { Grid, Link, Paper, Typography } from "@material-ui/core";
import ReactMarkdown from "markdown-to-jsx";
import { NextPage } from "next";
import * as React from "react";

import { CreateSessionForm } from "../lib/components/forms/CreateSessionForm";
import { Page } from "../lib/components/layout/Page";
import { TitleSubtitleBox } from "../lib/components/layout/TitleSubtitleBox";
import { useTranslation } from "../lib/util/i18n";

const AboutPage: NextPage<{}, void> = () => {
  const { t } = useTranslation(["about"]);

  const options = {
    overrides: {
      p: { component: Typography, props: { paragraph: true } },
    },
  };

  return (
    <Page title="About">
      <Grid item xs={12}>
        <TitleSubtitleBox />
      </Grid>
      <Grid item xs={12}>
        <hr />
      </Grid>
      <Grid item xs={12} container justify="center">
        <ReactMarkdown options={options}>{t("problem_text")}</ReactMarkdown>
        <ReactMarkdown options={options}>{t("solution_text")}</ReactMarkdown>
        <ReactMarkdown options={options}>{t("advantage_text")}</ReactMarkdown>
      </Grid>
      <Grid xs={12} container justify="center">
        <Grid xs={6} item>
          <Paper>
            <CreateSessionForm />
          </Paper>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <br />
      </Grid>
    </Page>
  );
};

export default AboutPage;
