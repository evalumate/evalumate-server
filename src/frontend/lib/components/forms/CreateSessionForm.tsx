import { Captcha } from "./fields/Captcha";
import { createSession } from "../../api/session";
import { CaptchaSolution } from "../../models/CaptchaSolution";
import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { setSession, setUserRole, showSnackbar } from "../../store/actions/global";
import { Box, Button, FormControlLabel, Grid, Tooltip, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { Switch, TextField } from "formik-material-ui";
import getConfig from "next/config";
import { useRouter } from "next/router";
import * as React from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";

const { publicRuntimeConfig } = getConfig();
const sessionNameMaxLength: number = publicRuntimeConfig.sessionNameMaxLength;

type FormValues = {
  sessionName: string;
  captcha: CaptchaSolution;
  captchaRequired: boolean;
};

const FormSchema = Yup.object().shape({
  sessionName: Yup.string()
    .min(2, "Too Short!")
    .max(sessionNameMaxLength, "Too Long!")
    .required("Required"),
});

export const CreateSessionForm: React.FunctionComponent = (props) => {
  const [invalidCaptchaSolutionCount, setInvalidCaptchaSolutionCount] = React.useState(0);
  const router = useRouter();
  const dispatch = useDispatch();

  const onSessionCreated = (session: Session) => {
    dispatch(setSession(session));
    dispatch(setUserRole(UserRole.Owner));
    dispatch(showSnackbar(`Session "${session.name}" was created`));
    router.push(`/${session.id}`);
  };

  const onCreateFormSubmit = async (values: FormValues) => {
    const session = await createSession(values);
    if (!session) {
      // Captcha solution was invalid
      setInvalidCaptchaSolutionCount(invalidCaptchaSolutionCount + 1);
    } else {
      onSessionCreated(session);
    }
  };

  return (
    <Formik
      initialValues={{
        sessionName: "",
        captcha: { token: "", solution: "" },
        captchaRequired: false,
      }}
      validationSchema={FormSchema}
      onSubmit={onCreateFormSubmit}
    >
      <Form>
        <Box marginBottom={3}>
          <Typography variant="h4" align="center">
            Create a new session
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field
              name="sessionName"
              label="Session name"
              inputProps={{ maxLength: sessionNameMaxLength }}
              component={TextField}
            />
          </Grid>
          <Grid item xs={12} sm={6} container alignItems="center" justify="center">
            <Tooltip title="Whether participants will need to solve a captcha">
              <FormControlLabel
                control={<Field name="captchaRequired" component={Switch} />}
                label="Captcha required?"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <Captcha invalidSolutionCount={invalidCaptchaSolutionCount} />
          </Grid>
          <Grid item xs={12} container alignItems="center" justify="center">
            <Button type="submit" variant="contained" color="primary">
              Create session
            </Button>
          </Grid>
        </Grid>
      </Form>
    </Formik>
  );
};
