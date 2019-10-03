import "./Page.scss";
import Menu from "../../Menu/Menu";
import React, { FunctionComponent } from "react";
import { GridContainer } from "react-foundation";

type PageProps = {
  hideMenu?: boolean;
};

export const Page: FunctionComponent<PageProps> = ({ hideMenu = false, children }) => {
  return (
    <div id="page">
      {!hideMenu && <Menu />}
      <GridContainer id="content">{children}</GridContainer>
    </div>
  );
};
