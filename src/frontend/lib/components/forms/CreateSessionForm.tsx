import { Captcha } from "./fields/Captcha";
import { createSession } from "../../api/session";
import { CaptchaSolution } from "../../models/CaptchaSolution";
import { Session } from "../../models/Session";
import { UserRole } from "../../models/UserRole";
import { setSession, setUserRole } from "../../store/actions/global";
import { Box, Button, FormControlLabel, Grid, Tooltip, Typography } from "@material-ui/core";
import { Field, Form, Formik, FormikActions } from "formik";
import { Switch, TextField } from "formik-material-ui";
import getConfig from "next/config";
import { useRouter } from "next/router";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
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

type Props = ConnectedProps<typeof connectToRedux>;

export const InternalCreateSessionForm: React.FunctionComponent<Props> = props => {
  const [invalidCaptchaSolutionCount, setInvalidCaptchaSolutionCount] = React.useState(0);
  const router = useRouter();

  const onSessionCreated = (session: Session) => {
    props.setSession(session);
    props.setUserRole(UserRole.Owner);
    router.push(`/master/${session.id}`);
  };

  const onCreateFormSubmit = async (values: FormValues, actions: FormikActions<FormValues>) => {
    const session = await createSession(values);
    if (!session) {
      // Captcha solution was invalid
      setInvalidCaptchaSolutionCount(invalidCaptchaSolutionCount + 1);
    } else {
      onSessionCreated(session);
    }
    actions.setSubmitting(false);
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

const mapDispatchToProps = {
  setUserRole,
  setSession,
};

const connectToRedux = connect(
  null,
  mapDispatchToProps
);

export const CreateSessionForm = connectToRedux(InternalCreateSessionForm);
