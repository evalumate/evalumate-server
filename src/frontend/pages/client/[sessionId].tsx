import { Page } from "../../lib/components/layout/Page";
import { setSession, setUserRole } from "../../lib/store/actions/global";
import { selectSession, selectUserRole } from "../../lib/store/selectors/global";
import { NextReduxPage } from "NextReduxTypes";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { UnderstandingBulb } from "../../lib/components/content/UnderstandingBulb";

type InitialProps = {
  sessionIsValid: boolean;
};

type Props = InitialProps & ConnectedProps<typeof connectToRedux>;

const ClientPage: NextReduxPage<Props, InitialProps> = props => {
  const title = props.sessionIsValid ? props.session.name : "Invalid session";
  return (
    <Page title={title} maxWidth="sm">
      <UnderstandingBulb />
    </Page>
  );
};

ClientPage.getInitialProps = async ({ store }) => {
  // TODO check if the session is valid
  return { sessionIsValid: false };
};

const mapStateToProps = (state: RootState) => ({
  session: selectSession(state),
  userRole: selectUserRole(state),
});

const mapDispatchToProps = {
  setUserRole,
  setSession,
};

const connectToRedux = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default connectToRedux(ClientPage);
