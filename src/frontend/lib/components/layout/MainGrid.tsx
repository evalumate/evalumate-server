import { Container, Grid } from "@material-ui/core";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import * as React from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      paddingTop: theme.spacing(3),
    },
  })
);

type Props = {
  /**
   * The `Container`'s `maxWidth` property. Defaults to "lg".
   */
  maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl";
};

export const MainGrid: React.FunctionComponent<Props> = ({ maxWidth = "lg", children }) => {
  const classes = useStyles({});

  return (
    <Container maxWidth={maxWidth} className={classes.root}>
      <Grid container spacing={3}>
        {children}
      </Grid>
    </Container>
  );
};
