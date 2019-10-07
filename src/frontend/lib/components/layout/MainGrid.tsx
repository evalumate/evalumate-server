import * as React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { Container, Grid } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      paddingTop: theme.spacing(3),
    },
  })
);

export const MainGrid: React.FunctionComponent = props => {
  const { children } = props;
  const classes = useStyles({});

  return (
    <Container maxWidth="lg" className={classes.root}>
      <Grid container spacing={3}>
        {children}
      </Grid>
    </Container>
  );
};
