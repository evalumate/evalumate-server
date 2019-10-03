import "./Captcha.scss";
import { Captcha as ApiCaptcha, getCaptcha } from "../../util/api";
import { FormikFoundationInput } from "../FormikFoundationInput/FormikFoundationInput";
import { connect, FormikContext } from "formik";
import React, { ComponentType, useEffect, useState } from "react";
import { Cell, Grid } from "react-foundation";
import config from "react-global-configuration";
import InlineSVG from "svg-inline-react";

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

const Captcha: ComponentType<CaptchaProps & { formik: FormikContext<any> }> = props => {
  const [captcha, setCaptcha] = useState({ image: "", token: "" });
  const [showRetryMessage, setShowRetryMessage] = useState(false);

  useEffect(() => {
    // Load a captcha on mount and when invalidSolutionCount changes
    getCaptcha().then(setCaptcha);

    // Reset the solution if invalidSolutionCount was changed
    if (props.invalidSolutionCount && props.invalidSolutionCount > 0) {
      setShowRetryMessage(true);
      props.formik.setFieldValue("captcha.solution", "", true); // Revalidate to show retry message
    }
  }, [props.invalidSolutionCount]);

  useEffect(() => {
    // Set the captcha token as a formik field on captcha updates
    if (captcha.token !== "") props.formik.setFieldValue("captcha.token", captcha.token, false);
  }, [captcha]);

  const validateSolution = (value: string) => {
    if (showRetryMessage) {
      if (value.length < config.get("captchaLength")) {
        return "Please try again!";
      } else {
        setShowRetryMessage(false); // Don't show the error again on subsequent validations
      }
    }
    if (value.length == 0) {
      return "Required";
    }
    if (value.length < config.get("captchaLength")) {
      return "Too short";
    }
  };

  return (
    <div className="captcha">
      <label>Please enter the text from the picture below:</label>
      <Grid>
        <Cell shrink={"all"}>
          <InlineSVG src={captcha.image} className="captcha-image" />
        </Cell>
        <Cell auto={"all"}>
          <FormikFoundationInput
            isInvalid={true}
            name="captcha.solution"
            validate={validateSolution}
            maxLength={config.get("captchaLength")}
          />
        </Cell>
      </Grid>
    </div>
  );
};

/**
 * To be used within a Formik form! A component rendering a captcha and a formik field `captcha` of
 * type `CaptchaSolution` that is populated with the captcha's token and the user-entered solution.
 *
 */
export default connect<CaptchaProps>(Captcha);
