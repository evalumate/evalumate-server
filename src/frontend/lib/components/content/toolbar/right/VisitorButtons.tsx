import { LinkedMenuButton } from "../../../layout/toolbar/LinkedMenuButton";
import * as React from "react";

export const VisitorButtons: React.FunctionComponent = () => (
  <>
    <LinkedMenuButton text="Join Session" href="/client" />
    <LinkedMenuButton text="Create Session" href="/master" />
    <LinkedMenuButton text="About" href="/about" />
  </>
);
