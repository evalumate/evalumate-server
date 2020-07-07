import { Link, Theme, Typography, WithStyles, createStyles, withStyles } from "@material-ui/core";
import { MarkdownProps, default as ReactMarkdown } from "markdown-to-jsx";
import React from "react";

// Based on https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/blog/Markdown.js

const styles = (theme: Theme) =>
  createStyles({
    listItem: {
      marginTop: theme.spacing(1),
    },
  });

const overrides = {
  h1: {
    component: Typography,
    props: {
      gutterBottom: true,
      variant: "h5",
    },
  },
  h2: { component: Typography, props: { gutterBottom: true, variant: "h6" } },
  h3: { component: Typography, props: { gutterBottom: true, variant: "subtitle1" } },
  h4: {
    component: Typography,
    props: { gutterBottom: true, variant: "caption", paragraph: true },
  },
  p: { component: Typography, props: { paragraph: true } },
  a: { component: Link },
  li: {
    component: withStyles(styles)((({ classes, ...props }) => (
      <li className={classes.listItem}>
        <Typography component="span" {...props} />
      </li>
    )) as React.FunctionComponent<WithStyles<typeof styles>>),
  },
};

export const Markdown: React.FunctionComponent<MarkdownProps> = ({ options, ...props }) => (
  <ReactMarkdown
    options={{ overrides: { ...overrides, ...options?.overrides }, ...options }}
    {...props}
  />
);
