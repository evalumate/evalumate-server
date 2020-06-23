import { Box, Button, FormControlLabel, Grid, Tooltip, Typography } from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import { Switch, TextField } from "formik-material-ui";
import getConfig from "next/config";
import { useRouter } from "next/router";
import * as React from "react";
import * as Yup from "yup";

import { CaptchaSolution } from "../../models/CaptchaSolution";
import { useThunkDispatch } from "../../store";
import { createSession } from "../../store/thunks/session";
import { Captcha } from "./fields/Captcha";

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
  const dispatch = useThunkDispatch();

  const onCreateFormSubmit = async (values: FormValues) => {
    const session = await dispatch(createSession(values));
    if (!session) {
      // Captcha solution was invalid
      setInvalidCaptchaSolutionCount(invalidCaptchaSolutionCount + 1);
    } else {
      router.push(`/${session.id}`);
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
