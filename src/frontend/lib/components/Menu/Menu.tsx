import "./Menu.scss";
import React from "react";
import {
  Menu as FoundationMenu,
  MenuItem,
  ResponsiveNavigation,
  TitleBarTitle,
  TopBarTitle,
} from "react-foundation";

export default function() {
  return (
    <ResponsiveNavigation>
      <TopBarTitle>EvaluMate</TopBarTitle>
      <FoundationMenu className="vertical medium-horizontal main-menu">
        <MenuItem>
          <a>Join Session</a>
        </MenuItem>
        <MenuItem>
          <a>Create Session</a>
        </MenuItem>
        <MenuItem>
          <a>About</a>
        </MenuItem>
      </FoundationMenu>
    </ResponsiveNavigation>
  );
}
