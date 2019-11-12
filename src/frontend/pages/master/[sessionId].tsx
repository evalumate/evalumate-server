import { HistoryChart } from "../../lib/components/content/master/HistoryChart";
import { Page } from "../../lib/components/layout/Page";
import { Paper } from "../../lib/components/layout/Paper";
import { selectSession, selectUserRole } from "../../lib/store/selectors/global";
import { NextReduxPage } from "NextReduxTypes";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";

type Props = ConnectedProps<typeof connectToRedux>;

const MasterPage: NextReduxPage<Props> = props => (
  <Page title={props.session && props.session.name}>
    <Paper>
      <HistoryChart />
    </Paper>
  </Page>
);

const mapStateToProps = (state: RootState) => ({
  session: selectSession(state),
  userRole: selectUserRole(state),
});

const mapDispatchToProps = {};

const connectToRedux = connect(mapStateToProps, mapDispatchToProps);

export default connectToRedux(MasterPage);
