import { Link, Theme, Typography, WithStyles, createStyles, withStyles } from "@material-ui/core";
import { MarkdownToJSX, default as ReactMarkdown } from "markdown-to-jsx";
import * as React from "react";

// Based on https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/blog/Markdown.js

const styles = (theme: Theme) =>
  createStyles({
    listItem: {
      marginTop: theme.spacing(1),
    },
  });

const overrides: MarkdownToJSX.Overrides = {
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

export const Markdown: typeof ReactMarkdown = ({ options, ...props }) => (
  <ReactMarkdown
    options={{
      overrides: {
        ...overrides,
        ...(options?.overrides as MarkdownToJSX.Overrides) /*Why wouldn't TypeScript accept an optional undefined here? Spreading undefined into an object is legal and no risk here!*/,
      },
      ...options,
    }}
    {...props}
  />
);
