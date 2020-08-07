import { Box, Grid, Link, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import ReactMarkdown from "markdown-to-jsx";
import { NextPage } from "next";
import * as React from "react";

import { CreateSessionForm } from "../lib/components/forms/CreateSessionForm";
import { Page } from "../lib/components/layout/Page";
import { Paper } from "../lib/components/layout/Paper";
import { useTranslation } from "../lib/util/i18n";

const SessionPage: NextPage<{}, void> = () => {
  const { t } = useTranslation(["createSession"]);
  const theme = useTheme();
  const isScreenMediumUpwards = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Page title="Create Session">
      <Grid item xs={12} md={6} container justify="center" style={{ paddingRight: "50" }}>
        <Box borderRight={isScreenMediumUpwards ? 2 : 0} paddingRight={2}>
          <ReactMarkdown
            options={{
              overrides: {
                p: { component: Typography, props: { paragraph: true } },
              },
            }}
          >
            {t("explanation")}
          </ReactMarkdown>
        </Box>
      </Grid>
      <Grid xs={12} md={6} item container justify="center">
        <Paper>
          <CreateSessionForm />
        </Paper>
      </Grid>
    </Page>
  );
};

export default SessionPage;
