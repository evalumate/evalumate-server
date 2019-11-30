import { UnderstandingBulb } from "../../lib/components/content/UnderstandingBulb";
import { Page } from "../../lib/components/layout/Page";
import { setSession, setUserRole, showSnackbar } from "../../lib/store/actions/global";
import { selectSession, selectUserRole } from "../../lib/store/selectors/global";
import { NextPage } from "next";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { UserRole } from "../../lib/models/UserRole";
import { getSession, joinSession } from "../../lib/api/session";
import { setUnderstanding, setMember } from "../../lib/store/actions/member";
import { JoinSessionForm } from "../../lib/components/forms/JoinSessionForm";

type InitialProps = {
  showCaptchaForm: boolean;
};

type Props = InitialProps & ConnectedProps<typeof connectToRedux>;

const ClientPage: NextPage<Props, InitialProps> = props => {
  if (!props.session) {
    return null;
  }

  return (
    <Page title={props.session.name} maxWidth="sm">
      {props.showCaptchaForm && <JoinSessionForm session={props.session} />}
      {!props.showCaptchaForm && <UnderstandingBulb />}
    </Page>
  );
};

ClientPage.getInitialProps = async ({ store, query }) => {
  let showCaptchaForm: boolean = false;

  if (selectUserRole(store.getState()) === UserRole.Visitor) {
    // A visitor wants to join a session
    const sessionId = query.sessionId as string;
    const session = await getSession(sessionId);

    if (!session) {
      store.dispatch(showSnackbar("Invalid session"));
      // TODO redirect?
    } else {
      store.dispatch(setSession(session));

      if (session.captchaRequired) {
        // Visitor has to enter a captcha to join the session
        showCaptchaForm = true;
      } else {
        // Visitor joins session
        // TODO implement sagas for session joining and leaving + error handling
        const member = await joinSession(session.id);
        store.dispatch(setMember(member));
        store.dispatch(setUnderstanding(true));
        store.dispatch(setUserRole(UserRole.Member));
      }
    }
  }

  return { showCaptchaForm };
};

const mapStateToProps = (state: RootState) => ({
  session: selectSession(state),
  userRole: selectUserRole(state),
});

const mapDispatchToProps = {
  setUserRole,
  setSession,
};

const connectToRedux = connect(mapStateToProps, mapDispatchToProps);

export default connectToRedux(ClientPage);
