import "./Menu.scss";
import React from "react";
import { Link } from "react-router-dom";
import {
  Menu as FoundationMenu,
  MenuItem,
  ResponsiveNavigation,
  TopBarTitle,
} from "react-foundation";

export default function() {
  return (
    <ResponsiveNavigation>
      <TopBarTitle>
        <Link to="/">EvaluMate</Link>
      </TopBarTitle>
      <FoundationMenu className="vertical medium-horizontal main-menu">
        <MenuItem>
          <Link to="/client">Join Session</Link>
        </MenuItem>
        <MenuItem>
          <Link to="/master">Create Session</Link>
        </MenuItem>
        <MenuItem>
          <Link to="/about">About</Link>
        </MenuItem>
      </FoundationMenu>
    </ResponsiveNavigation>
  );
}
