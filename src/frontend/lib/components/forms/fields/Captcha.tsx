import { getCaptcha } from "../../../api/captcha";
import { Grid } from "@material-ui/core";
import { connect, Field, FormikContext } from "formik";
import { TextField } from "formik-material-ui";
import getConfig from "next/config";
import * as React from "react";
import InlineSVG from "svg-inline-react";

const { publicRuntimeConfig } = getConfig();
const captchaSolutionLength: number = publicRuntimeConfig.captchaSolutionLength;

type CaptchaProps = {
  /**
   * The number of invalid captcha solutions entered yet. Should initially be 0.
   */
  invalidSolutionCount?: number;
};

export type CaptchaSolution = {
  token: string;
  solution: string;
};

const InternalCaptcha: React.ComponentType<
  CaptchaProps & { formik: FormikContext<any> }
> = props => {
  const [captcha, setCaptcha] = React.useState({ image: "", token: "" });
  const [showRetryMessage, setShowRetryMessage] = React.useState(false);

  React.useEffect(() => {
    // Load a captcha on mount and when invalidSolutionCount changes
    getCaptcha().then(setCaptcha);

    // Reset the solution if invalidSolutionCount was changed
    if (props.invalidSolutionCount && props.invalidSolutionCount > 0) {
      setShowRetryMessage(true);
      props.formik.setFieldValue("captcha.solution", "", true); // Revalidate to show retry message
    }
  }, [props.invalidSolutionCount]);

  React.useEffect(() => {
    // Set the captcha token as a formik field on captcha updates
    if (captcha.token !== "") props.formik.setFieldValue("captcha.token", captcha.token, false);
  }, [captcha]);

  const validateSolution = (value: string) => {
    if (showRetryMessage) {
      if (value.length < captchaSolutionLength) {
        return "Please try again!";
      } else {
        setShowRetryMessage(false); // Don't show the error again on subsequent validations
      }
    }
    if (value.length == 0) {
      return "Required";
    }
    if (value.length < captchaSolutionLength) {
      return "Too short";
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Field
          name="captcha.solution"
          label="What letters do you see?"
          validate={validateSolution}
          isInvalid={true}
          inputProps={{ maxLength: captchaSolutionLength }}
          component={TextField}
        />
      </Grid>
      <Grid item xs={12} sm={6} container alignItems="center" justify="center">
        <InlineSVG src={captcha.image} />
      </Grid>
    </Grid>
  );
};

/**
 * To be used within a Formik form. A component rendering a captcha and a formik field `captcha` of
 * type `CaptchaSolution` that is populated with the captcha's token and the user-entered solution.
 */
export const Captcha = connect<CaptchaProps>(InternalCaptcha);
