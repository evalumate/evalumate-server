import { Field, connect } from "formik";
import { TextField } from "formik-material-ui";
import getConfig from "next/config";
import * as React from "react";

import { Session } from "../../../models/Session";
import { useThunkDispatch } from "../../../store";
import { fetchSession } from "../../../store/thunks/session";
import { useTranslation } from "../../../util/i18n";

const { publicRuntimeConfig } = getConfig();
const sessionIdLength: number = publicRuntimeConfig.sessionIdLength;

type Props = {
  /**
   * A callback that is executed when a valid session id has been entered and the corresponding
   * `Session` object has been fetched from the API. The `Session` object is provided as a parameter
   * to the callback. When the session id is changed to be invalid afterwards, the callback is
   * invoked again with `null`.
   */
  onSessionChange: (session: Session | null) => void;
};

/**
 * To be used within a Formik form. A component rendering a `sessionId` formik input field which is
 * validated using the API. When the entered session id has been validated, the corresponding
 * `Session` object is passed to the props' `onSessionFetched` callback.
 */
export const SessionIdField = connect<Props, { sessionId: string }>(
  ({ formik, onSessionChange }) => {
    const [session, setSession] = React.useState<Session | null>(null);
    const dispatch = useThunkDispatch();
    const { t } = useTranslation(["errMsgs"]);

    // Call `onSessionChange` when `session` is updated
    React.useEffect(() => {
      onSessionChange(session);
    }, [session]);

    const validateSessionId = async (sessionId: string) => {
      let error: string | null = null;
      if (sessionId.length == sessionIdLength) {
        // Skip validation if the sessionId has not changed since the last successful validation
        if (!(session && session.id == sessionId)) {
          // Check if session exists
          const fetchedSession = await dispatch(fetchSession(sessionId));
          if (!fetchedSession) {
            // sessionId is invalid
            if (session) {
              // Unset any previously fetched session
              setSession(null);
            }
            error = t("invalid");
          } else {
            // sessionId is valid
            setSession(fetchedSession);
          }
        }
        if (!formik.touched.sessionId) {
          // Set the field to touched to show any error messages from now on
          formik.setFieldTouched("sessionId", true);
        }
      } else {
        // sessionId is shorter than sessionIdLength
        if (session) {
          // Unset any previously fetched session
          setSession(null);
        }
        error = sessionId.length > 0 ? t("too_short") : t("required");
      }
      return error;
    };

    return (
      <Field
        name="sessionId"
        label="Session ID"
        validate={validateSessionId}
        inputProps={{ maxLength: sessionIdLength }}
        component={TextField}
      />
    );
  }
);
