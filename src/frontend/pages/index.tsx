import { Page } from "../lib/components/layout/Page";
import { NextReduxPage } from "NextReduxTypes";
import * as React from "react";

const HomePage: NextReduxPage<{}, void> = () => {
  return <Page title="EvaluMate – Feedback Made Easy" titleAddHomepageTitle={false}></Page>;
};

export default HomePage;
