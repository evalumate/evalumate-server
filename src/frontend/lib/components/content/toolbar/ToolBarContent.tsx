import { LeftContent } from "./LeftContent";
import { RightContent } from "./RightContent";
import { Title } from "./Title";
import * as React from "react";

export const ToolBarContent: React.FunctionComponent = () => {
  return (
    <>
      <LeftContent />
      <Title />
      <RightContent />
    </>
  );
};
