import { Page } from "../lib/components/layout/Page";
import { setSession, setUserRole, showSnackbar } from "../lib/store/actions/global";
import { selectSession, selectUserRole } from "../lib/store/selectors/global";
import { NextPage } from "next";
import * as React from "react";
import { useSelector } from "react-redux";
import { UserRole } from "../lib/models/UserRole";
import { getSession, joinSession } from "../lib/api/session";
import { setUnderstanding, setMember } from "../lib/store/actions/member";
import { ClientPageContent } from "../lib/components/content/client/ClientPageContent";
import { MasterPageContent } from "../lib/components/content/master/MasterPageContent";

type InitialProps = {
  sessionExists: boolean;
};

const SessionPage: NextPage<InitialProps> = ({ sessionExists }) => {
  const session = useSelector(selectSession);
  const userRole = useSelector(selectUserRole);

  if (!sessionExists) {
    return <Page title="Session Not Found"></Page>;
  }

  if (session === null) {
    return null;
  }

  if (userRole === UserRole.Owner) {
    return (
      <Page title={session!.name}>
        <MasterPageContent />
      </Page>
    );
  }

  return (
    <Page title={session!.name} maxWidth="sm">
      <ClientPageContent session={session!} />
    </Page>
  );
};

SessionPage.getInitialProps = async ({ query, store, res }) => {
  // Check the session id
  const sessionId = query.sessionId as string;
  const session = await getSession(sessionId);

  if (session === null) {
    if (typeof res !== "undefined") {
      res.statusCode = 404;
    }
    return { sessionExists: false };
  }

  const userRole = selectUserRole(store.getState());

  if (userRole === UserRole.Visitor) {
    // A visitor wants to join the session
    store.dispatch(setSession(session));

    // Check if the visitor has to enter a captcha to join the session
    if (!session.captchaRequired) {
      // Visitor joins session
      // TODO implement thunk actions for session joining and leaving + error handling
      const member = await joinSession(session.id);
      store.dispatch(setMember(member));
      store.dispatch(setUnderstanding(true));
      store.dispatch(setUserRole(UserRole.Member));
    }
  }

  return { sessionExists: true };
};

export default SessionPage;
