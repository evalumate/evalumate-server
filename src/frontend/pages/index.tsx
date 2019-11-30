import { Page } from "../lib/components/layout/Page";
import * as React from "react";
import { NextPage } from "next";

const HomePage: NextPage<{}, void> = () => {
  return <Page title="EvaluMate – Feedback Made Easy" titleAddHomepageTitle={false}></Page>;
};

export default HomePage;
