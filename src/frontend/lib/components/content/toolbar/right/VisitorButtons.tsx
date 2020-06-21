import * as React from "react";

import { LinkedMenuButton } from "../../../layout/toolbar/LinkedMenuButton";

export const VisitorButtons: React.FunctionComponent = () => (
  <>
    <LinkedMenuButton text="About" href="/about" />
  </>
);
