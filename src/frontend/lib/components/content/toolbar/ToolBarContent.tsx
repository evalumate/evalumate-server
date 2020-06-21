import * as React from "react";

import { LeftContent } from "./left/LeftContent";
import { Title } from "./left/Title";
import { RightContent } from "./right/RightContent";

export const ToolBarContent: React.FunctionComponent = () => {
  return (
    <>
      <LeftContent />
      <Title />
      <RightContent />
    </>
  );
};
