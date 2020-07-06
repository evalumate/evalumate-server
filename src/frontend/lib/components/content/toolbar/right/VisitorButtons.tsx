import * as React from "react";

import { LinkedMenuButton } from "../../../layout/toolbar/LinkedMenuButton";

export const VisitorButtons: React.FunctionComponent = () => (
  <>
    <LinkedMenuButton text="Create session" href="/createSession" />
    <LinkedMenuButton text="Join session" href="/join" />
    <LinkedMenuButton text="About" href="/about" />
  </>
);
