import "./ClientPage.scss";
import React, { Component } from "react";
import Captcha from "../../Captcha/Captcha";

type ClientPageState = {
  session?: { id: string; name: string; captchaRequired: boolean };
  member?: { id: string; secret: string };
};

export default class ClientPage extends Component<{}, ClientPageState> {
  constructor(props: Readonly<{}>) {
    super(props);
    // TODO types for router session id matching
  }

  handleCaptchaSolutionChange(solution: string, token: string) {}

  render() {
    return <Captcha onSolutionChange={this.handleCaptchaSolutionChange} />;
  }
}
