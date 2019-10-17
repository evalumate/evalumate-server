import { Captcha } from "./fields/Captcha";
import { SessionIdField } from "./fields/SessionIdField";
import { joinSession } from "../../api/session";
import { CaptchaSolution } from "../../models/CaptchaSolution";
import { Member } from "../../models/Member";
import { Session } from "../../models/Session";
import { setSession, setUserRole } from "../../store/actions/global";
import { Box, Button, Grid, Typography } from "@material-ui/core";
import { Form, Formik, FormikActions } from "formik";
import { useRouter } from "next/router";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { UserRole } from "../../models/UserRole";
import { setMember } from "../../store/actions/member";

type FormValues = {
  sessionId: string;
  captcha: CaptchaSolution;
};

type Props = ConnectedProps<typeof connectToRedux> & {
  /**
   * If set, the session id input field will be hidden and only a captcha field will be shown. Note:
   * If the provided `Session` object has `captchaRequired` set to `false`, this component will not
   * render anything!
   */
  session?: Session;
};

export const InternalJoinSessionForm: React.FunctionComponent<Props> = props => {
  const sessionIsPredefined = typeof props.session !== "undefined";

  const [session, setSession] = React.useState<Session>(sessionIsPredefined ? props.session : null);
  const [invalidCaptchaSolutionCount, setInvalidCaptchaSolutionCount] = React.useState(0);
  const router = useRouter();

  const initialFormValues = {
    sessionId: typeof props.session === "undefined" ? "" : props.session.id,
    captcha: { token: "", solution: "" },
  };

  const onSessionChanged = (session: Session) => {
    setSession(session);
  };

  const onSessionJoined = (member: Member) => {
    props.setSession(session);
    props.setMember(member);
    props.setUserRole(UserRole.Member);
    router.push(`/client/${session.id}`);
  };

  const onJoinFormSubmit = async (values: FormValues, actions: FormikActions<FormValues>) => {
    // Session cannot be null at this point, because the Formik validation of the SessionIdField has
    // succeeded.
    let member: Member;
    if (session.captchaRequired) {
      member = await joinSession(session.id, values.captcha);
      if (!member) {
        // Captcha solution was invalid
        setInvalidCaptchaSolutionCount(invalidCaptchaSolutionCount + 1);
      }
    } else {
      member = await joinSession(session.id);
    }

    if (member) {
      onSessionJoined(member);
    }
    actions.setSubmitting(false);
  };

  return (
    <Formik initialValues={initialFormValues} onSubmit={onJoinFormSubmit}>
      <Form>
        <Box marginBottom={3}>
          <Typography variant="h4" align="center">
            Join {session ? `"${session.name}"` : "a session"}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <SessionIdField onSessionChange={onSessionChanged} />
          </Grid>
          {session && session.captchaRequired && (
            <Grid item xs={12}>
              <Captcha invalidSolutionCount={invalidCaptchaSolutionCount} stack />
            </Grid>
          )}
          <Grid item xs={12} container alignItems="center" justify="center">
            <Button type="submit" variant="contained" color="primary">
              Join session
            </Button>
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
};

const mapDispatchToProps = {
  setUserRole,
  setMember,
  setSession,
};

const connectToRedux = connect(
  null,
  mapDispatchToProps
);

export const JoinSessionForm = connectToRedux(InternalJoinSessionForm);
