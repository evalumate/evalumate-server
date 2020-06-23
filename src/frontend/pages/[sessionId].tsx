import { NextPage } from "next";
import * as React from "react";
import { useSelector } from "react-redux";
import { AppThunkDispatch } from "StoreTypes";

import { ClientPageContent } from "../lib/components/content/client/ClientPageContent";
import { MasterPageContent } from "../lib/components/content/master/MasterPageContent";
import { JoinSessionForm } from "../lib/components/forms/JoinSessionForm";
import { Page } from "../lib/components/layout/Page";
import { Session } from "../lib/models/Session";
import { UserRole } from "../lib/models/UserRole";
import { selectSession, selectUserRole } from "../lib/store/selectors/session";
import { fetchSession, joinSession } from "../lib/store/thunks/session";

type InitialProps = {
  sessionNotFound?: boolean;
  sessionToJoin?: Session;
};

const SessionPage: NextPage<InitialProps> = ({ sessionNotFound, sessionToJoin }) => {
  const session = useSelector(selectSession);
  const userRole = useSelector(selectUserRole);

  if (sessionNotFound) {
    return <Page title="Session Not Found"></Page>;
  }

  if (sessionToJoin && session === null) {
    // Show a join form for a session that requires a captcha
    return (
      <Page title={sessionToJoin.name} maxWidth="sm">
        {sessionToJoin && <JoinSessionForm session={sessionToJoin} />}
        {!sessionToJoin && <ClientPageContent />}
      </Page>
    );
  }

  if (!session) {
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
      <ClientPageContent />
    </Page>
  );
};

SessionPage.getInitialProps = async ({ query, store, res }) => {
  // Check the session id
  const sessionId = query.sessionId as string;
  const dispatch = store.dispatch as AppThunkDispatch;
  const session = await dispatch(fetchSession(sessionId));

  if (typeof session === "undefined") {
    if (typeof res !== "undefined") {
      res.statusCode = 404;
    }
    return { sessionNotFound: true };
  }

  if (selectUserRole(store.getState()) === UserRole.Visitor) {
    // A visitor wants to join the session – join it right away if she does not need to enter a captcha
    if (!session.captchaRequired && (await dispatch(joinSession(session)))) {
      return {};
    }
  }

  return { sessionToJoin: session };
};

export default SessionPage;
