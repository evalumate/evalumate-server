import { CreateSessionForm } from "../../lib/components/forms/CreateSessionForm";
import { Page } from "../../lib/components/layout/Page";
import { Paper } from "../../lib/components/layout/Paper";
import { Session } from "../../lib/models/Session";
import { setSession } from "../../lib/store/actions/owner";
import { Grid } from "@material-ui/core";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";

type Props = ConnectedProps<typeof connectToRedux>;

const InitialMasterPage: React.FunctionComponent<Props> = props => {
  const onSessionCreated = (session: Session) => {
    // TODO set role to owner
    props.setSession(session);
  };

  return (
    <Page title="Create a session">
      <Grid item xs={12} md={6}>
        <Paper>
          <CreateSessionForm onSessionCreated={onSessionCreated} />
        </Paper>
      </Grid>
      {/* <Grid item xs={12} md={6}>
        <Paper>
          Attach to an existing session 
        </Paper>
      </Grid> */}
    </Page>
  );
};

const mapDispatchToProps = {
  setSession,
};

const connectToRedux = connect(
  null,
  mapDispatchToProps
);

export default connectToRedux(InitialMasterPage);
