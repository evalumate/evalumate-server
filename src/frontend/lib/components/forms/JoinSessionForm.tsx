import { Box, Button, Grid, Typography } from "@material-ui/core";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import * as React from "react";

import { CaptchaSolution } from "../../models/CaptchaSolution";
import { Member } from "../../models/Member";
import { Session } from "../../models/Session";
import { useThunkDispatch } from "../../store";
import { joinSession } from "../../store/thunks/session";
import { useTranslation } from "../../util/i18n";
import { Captcha } from "./fields/Captcha";
import { SessionIdField } from "./fields/SessionIdField";

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
    props.session ? props.session : null
  );
  const [invalidCaptchaSolutionCount, setInvalidCaptchaSolutionCount] = React.useState(0);
  const router = useRouter();
  const dispatch = useThunkDispatch();
  const { t } = useTranslation(["joinSessionForm"]);

  const initialFormValues = {
    sessionId: session ? session.id : "",
    captcha: { token: "", solution: "" },
  };

  const onJoinFormSubmit = async (values: FormValues) => {
    // Session cannot be null at this point, because the Formik validation of the SessionIdField has
    // succeeded.
    let member: Member | undefined;
    if (session!.captchaRequired) {
      member = await dispatch(joinSession(session!, values.captcha));
      if (!member) {
        // Captcha solution was invalid
        setInvalidCaptchaSolutionCount(invalidCaptchaSolutionCount + 1);
      }
    } else {
      member = await dispatch(joinSession(session!));
    }

    if (member) {
      router.push(`/${session!.id}`);
    }
  };

  return (
    <Formik initialValues={initialFormValues} onSubmit={onJoinFormSubmit}>
      <Form>
        <Box marginBottom={3}>
          <Typography variant="h4" align="center">
            {t("title_first_part")}
            {session ? `"${session.name} + ${t("title_third_part")}"` : t("title_second_part")}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {!props.session && (
            <Grid item xs={12}>
              <SessionIdField onSessionChange={setLocalSession} />
            </Grid>
          )}
          {session && session.captchaRequired && (
            <Grid item xs={12}>
              <Captcha invalidSolutionCount={invalidCaptchaSolutionCount} stack />
            </Grid>
          )}
          <Grid item xs={12} container alignItems="center" justify="center">
            <Button type="submit" variant="contained" color="primary">
              {t("button_text")}
            </Button>
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
};
