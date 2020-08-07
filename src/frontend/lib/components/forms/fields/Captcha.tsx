import { Grid } from "@material-ui/core";
import { Field, connect } from "formik";
import { TextField } from "formik-material-ui";
import getConfig from "next/config";
import * as React from "react";
import InlineSVG from "svg-inline-react";

import { useThunkDispatch } from "../../../store";
import { fetchCaptcha } from "../../../store/thunks/captcha";
import { useTranslation } from "../../../util/i18n";

const { publicRuntimeConfig } = getConfig();
const captchaSolutionLength: number = publicRuntimeConfig.captchaSolutionLength;

type Props = {
  /**
   * The number of invalid captcha solutions entered yet. Should initially be 0.
   */
  invalidSolutionCount?: number;
  /**
   * Whether or not to stack the fields (text input and captcha) on medium (and upwards) screen sizes.
   */
  stack?: boolean;
};

/**
 * To be used within a Formik form. A component rendering a captcha and a formik field `captcha` of
 * type `CaptchaSolution` that is populated with the captcha's token and the user-entered solution.
 */
export const Captcha = connect<Props>(({ formik, invalidSolutionCount, stack = false }) => {
  const [captcha, setCaptcha] = React.useState({ image: "", token: "" });
  const [showRetryMessage, setShowRetryMessage] = React.useState(false);
  const dispatch = useThunkDispatch();
  const { t } = useTranslation(["captcha", "errMsgs"]);

  React.useEffect(() => {
    // Load a captcha on mount and when invalidSolutionCount changes
    dispatch(fetchCaptcha()).then((captcha) => {
      if (typeof captcha !== "undefined") {
        setCaptcha(captcha);
      }
    });

    // Reset the solution if invalidSolutionCount was changed
    if (invalidSolutionCount && invalidSolutionCount > 0) {
      setShowRetryMessage(true);
      formik.setFieldValue("captcha.solution", "", true); // Revalidate to show retry message
    }
  }, [invalidSolutionCount]);

  React.useEffect(() => {
    // Set the captcha token as a formik field on captcha updates
    if (captcha.token !== "") {
      formik.setFieldValue("captcha.token", captcha.token, false);
    }
  }, [captcha]);

  const validateSolution = (value: string) => {
    if (showRetryMessage) {
      if (value.length < captchaSolutionLength) {
        return t("errMsgs:try_again");
      } else {
        setShowRetryMessage(false); // Don't show the error again on subsequent validations
      }
    }
    if (value.length == 0) {
      return t("errMsgs:required");
    }
    if (value.length < captchaSolutionLength) {
      return t("errMsgs:too_short");
    }
  };

  const smallScreenFieldWidth = stack ? 12 : 6;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={smallScreenFieldWidth}>
        <Field
          name="captcha.solution"
          label={t("captcha:solution_placeholder")}
          validate={validateSolution}
          inputProps={{ maxLength: captchaSolutionLength }}
          component={TextField}
        />
      </Grid>
      <Grid item xs={12} sm={smallScreenFieldWidth} container alignItems="center" justify="center">
        <InlineSVG src={captcha.image} />
      </Grid>
    </Grid>
  );
});
