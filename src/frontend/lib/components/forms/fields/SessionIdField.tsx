import { getCaptcha } from "../../../api/captcha";
import { Grid } from "@material-ui/core";
import { connect, Field, FormikContext } from "formik";
import { TextField } from "formik-material-ui";
import getConfig from "next/config";
import * as React from "react";
import InlineSVG from "svg-inline-react";
import { Session } from "../../../models/Session";
import { getSession } from "../../../api/session";

const { publicRuntimeConfig } = getConfig();
const sessionIdLength: number = publicRuntimeConfig.sessionIdLength;

type Props = {
  /**
   * A callback that is executed when a valid session id has been entered and the corresponding
   * `Session` object has been fetched from the API. The `Session` object is provided as a parameter
   * to the callback. When the session id is changed to be invalid afterwards, the callback is
   * invoked again with `null`.
   */
  onSessionChange: (session: Session) => void;
};

const InternalSessionIdField: React.ComponentType<
  Props & { formik: FormikContext<{ sessionId: string }> }
> = ({ formik, onSessionChange }) => {
  const [session, setSession] = React.useState<Session>(null);

  // Call onSessionChange when `session` is updated
  React.useEffect(() => {
    onSessionChange(session);
  }, [session]);

  const validateSessionId = async (sessionId: string) => {
    if (sessionId.length == sessionIdLength) {
      if (!formik.touched.sessionId) {
        // Set the field to touched to show error messages from now on
        formik.setFieldTouched("sessionId", true);
      }
      // Skip validation if the sessionId has not changed since the last successful validation
      if (!(session && session.id == sessionId)) {
        // Check if session exists
        const fetchedSession = await getSession(sessionId);
        if (!fetchedSession) {
          // sessionId is invalid
          if (session) {
            // Unset any previously fetched session
            setSession(null);
          }
          return "Invalid";
        } else {
          // sessionId is valid
          setSession(fetchedSession);
        }
      }
    } else {
      // sessionId is shorter than sessionIdLength
      if (session) {
        // Unset any previously fetched session
        setSession(null);
      }
      return sessionId.length > 0 ? "Too short" : "Required";
    }
  };

  return (
    <Field
      name="sessionId"
      label="Session Id"
      validate={validateSessionId}
      inputProps={{ maxLength: sessionIdLength }}
      component={TextField}
    />
  );
};

/**
 * To be used within a Formik form. A component rendering a `sessionId` formik input field which is
 * validated using the API. When the entered session id has been validated, the corresponding
 * `Session` object is passed to the props' `onSessionFetched` callback.
 */
export const SessionIdField = connect<Props>(InternalSessionIdField);
