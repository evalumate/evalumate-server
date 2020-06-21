import { Captcha } from "./fields/Captcha";
import { SessionIdField } from "./fields/SessionIdField";
import { joinSession } from "../../api/session";
import { CaptchaSolution } from "../../models/CaptchaSolution";
import { Member } from "../../models/Member";
import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { setSession, setUserRole, showSnackbar } from "../../store/actions/global";
import { setMember, setUnderstanding } from "../../store/actions/member";
import { Box, Button, Grid, Typography } from "@material-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import * as React from "react";
import { useDispatch } from "react-redux";

type FormValues = {
  sessionId: string;
  captcha: CaptchaSolution;
};

type Props = {
  /**
   * If set, the session id input field will be hidden and only a captcha field will be shown. Note:
   * If the provided `Session` object has `captchaRequired` set to `false`, this component will not
   * render anything!
   */
  session?: Session;
};

export const JoinSessionForm: React.FunctionComponent<Props> = (props) => {
  const [session, setLocalSession] = React.useState<Session | null>(
    typeof props.session !== "undefined" ? props.session : null
  );
  const [invalidCaptchaSolutionCount, setInvalidCaptchaSolutionCount] = React.useState(0);
  const router = useRouter();
  const dispatch = useDispatch();

  const initialFormValues = {
    sessionId: typeof props.session === "undefined" ? "" : props.session.id,
    captcha: { token: "", solution: "" },
  };

  const onSessionJoined = (member: Member) => {
    dispatch(setSession(session));
    dispatch(setMember(member));
    dispatch(setUnderstanding(true));
    dispatch(setUserRole(UserRole.Member));
    dispatch(showSnackbar(`Joined session "${session!.name}"`));
    router.push(`/${session!.id}`);
  };

  const onJoinFormSubmit = async (values: FormValues) => {
    // Session cannot be null at this point, because the Formik validation of the SessionIdField has
    // succeeded.
    let member: Member;
    if (session!.captchaRequired) {
      member = await joinSession(session!.id, values.captcha);
      if (!member) {
        // Captcha solution was invalid
        setInvalidCaptchaSolutionCount(invalidCaptchaSolutionCount + 1);
      }
    } else {
      member = await joinSession(session!.id);
    }

    if (member) {
      onSessionJoined(member);
    } else {
      dispatch(showSnackbar("Sorry, something went wrong. Please try again!"));
    }
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
            <SessionIdField onSessionChange={setLocalSession} />
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
