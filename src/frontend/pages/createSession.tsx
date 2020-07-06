import { Box, Grid, Link, Typography } from "@material-ui/core";
import ReactMarkdown from "markdown-to-jsx";
import { NextPage } from "next";
import * as React from "react";

import { CreateSessionForm } from "../lib/components/forms/CreateSessionForm";
import { Page } from "../lib/components/layout/Page";
import { Paper } from "../lib/components/layout/Paper";
import { TitleSubtitleBox } from "../lib/components/layout/TitleSubtitleBox";
import { useTranslation } from "../lib/util/i18n";

const SessionPage: NextPage<{}, void> = () => {
  const { t } = useTranslation(["createSession"]);

  const options = {
    overrides: {
      p: { component: Typography, props: { paragraph: true } },
    },
  };

  return (
    <Page title="Create Session">
      <Grid item xs={6} container justify="center" style={{ paddingRight: "50" }}>
        <Box borderRight={2} paddingRight={2}>
          <ReactMarkdown options={options}>{t("explanation")}</ReactMarkdown>
        </Box>
      </Grid>
      <Grid xs={6} container justify="center">
        <Grid xs={12} item>
          <Paper>
            <CreateSessionForm />
          </Paper>
        </Grid>
      </Grid>
    </Page>
  );
};

export default SessionPage;
