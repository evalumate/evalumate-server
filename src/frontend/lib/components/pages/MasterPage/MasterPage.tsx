import "./MasterPage.scss";
import { createSession, Session } from "../../../util/api";
import Captcha, { CaptchaSolution } from "../../Captcha/Captcha";
import { FormikFoundationInput } from "../../FormikFoundationInput/FormikFoundationInput";
import { Page } from "../Page/Page";
import { Field, FieldProps, Form, Formik, FormikActions, FormikProps } from "formik";
import React, { FunctionComponent, useState } from "react";
import { Button, Cell, Grid, Switch } from "react-foundation";
import { RouteComponentProps } from "react-router-dom";
import * as Yup from "yup";

interface CreateSessionFormValues {
  sessionName: string;
  captcha: CaptchaSolution;
  captchaRequired: boolean;
}

const CreateSessionSchema = Yup.object().shape({
  sessionName: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

interface AttachSessionFormValues {
  id: string;
  key: boolean;
}

type RouteParameters = {
  sessionId: string;
};

const MasterPage: FunctionComponent<RouteComponentProps<RouteParameters>> = props => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [invalidCaptchaSolutionCount, setInvalidCaptchaSolutionCount] = useState(0);

  const onCreateFormSubmit = async (
    values: CreateSessionFormValues,
    actions: FormikActions<CreateSessionFormValues>
  ) => {
    //alert(JSON.stringify(values, null, 2));
    const session = await createSession(values);
    if (!session) {
      // The server replied with 403, captcha solution was invalid
      setInvalidCaptchaSolutionCount(invalidCaptchaSolutionCount + 1);
    } else {
      setSession(session);
      props.history.replace(`/master/${session.id}`);
    }
    actions.setSubmitting(false);
  };

  if (!session) {
    // Session master is not attached to a session
    // Options: Create session, attach to session
    return (
      <Page>
        <Grid className="session-master">
          <Cell auto={"all"} className="create">
            <Formik
              initialValues={{
                sessionName: "",
                captcha: { token: "", solution: "" },
                captchaRequired: false,
              }}
              validationSchema={CreateSessionSchema}
              onSubmit={onCreateFormSubmit}
            >
              {(formik: FormikProps<CreateSessionFormValues>) => (
                <Form>
                  <h4>Create a new session</h4>
                  <FormikFoundationInput name="sessionName" label="Session name" maxLength={50} />
                  <Captcha invalidSolutionCount={invalidCaptchaSolutionCount} />

                  <Field
                    render={({ field, form }: FieldProps<CreateSessionFormValues>) => (
                      <div>
                        <label>Captcha required?</label>
                        <Switch
                          {...field}
                          input={{ name: "captchaRequired" }}
                          active={{ text: "Yes" }}
                          inactive={{ text: "No" }}
                        />
                      </div>
                    )}
                  />
                  <Button>Create session</Button>
                </Form>
              )}
            </Formik>
          </Cell>
          <Cell small={12} medium={1} className="or">
            or
          </Cell>
          <Cell auto={"all"} className="attach">
            <h4>Attach to an existing session</h4>
            <input type="text" name="attachSessionId" placeholder="Session id" maxLength={10} />
            <input type="text" id="attachSessionKey" placeholder="Session key" maxLength={10} />
          </Cell>
        </Grid>
      </Page>
    );
  }
  return <div />;
};

export default MasterPage;
