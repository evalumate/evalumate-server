import { Page } from "../lib/components/layout/Page";
import { NextReduxPage } from "NextReduxTypes";
import * as React from "react";

const AboutPage: NextReduxPage<{}, void> = () => {
  return <Page title="About"></Page>;
};

export default AboutPage;
