import { CurrentUnderstandingChart } from "../../lib/components/content/master/CurrentUnderstandingChart";
import { HistoryChart } from "../../lib/components/content/master/HistoryChart";
import { Page } from "../../lib/components/layout/Page";
import { Paper } from "../../lib/components/layout/Paper";
import { selectSession, selectUserRole } from "../../lib/store/selectors/global";
import { Box, createStyles, Grid, makeStyles } from "@material-ui/core";
import { NextReduxPage } from "NextReduxTypes";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";

type Props = ConnectedProps<typeof connectToRedux>;

const useStyles = makeStyles(theme =>
  createStyles({
    root: {},
  })
);

const MasterPage: NextReduxPage<Props> = props => {
  const classes = useStyles();
  return (
    <Page title={props.session && props.session.name}>
      <Box clone order={{ xs: 2, md: 1 }}>
        <Grid item xs={12} md={10}>
          <Paper>
            <HistoryChart />
          </Paper>
        </Grid>
      </Box>
      <Box clone order={{ xs: 1, md: 2 }}>
        <Grid item xs={12} md={2}>
          <Paper>
            <CurrentUnderstandingChart />
          </Paper>
        </Grid>
      </Box>
    </Page>
  );
};

const mapStateToProps = (state: RootState) => ({
  session: selectSession(state),
  userRole: selectUserRole(state),
});

const mapDispatchToProps = {};

const connectToRedux = connect(mapStateToProps, mapDispatchToProps);

export default connectToRedux(MasterPage);
