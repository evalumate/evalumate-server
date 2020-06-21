import { LinkedListItem } from "../../../layout/toolbar/LinkedListItem";
import { List } from "@material-ui/core";
import { Info, Home } from "@material-ui/icons";
import * as React from "react";

export const MenuDrawerContent: React.FunctionComponent = () => (
  <>
    <List>
      <LinkedListItem icon={Home} text="Home" href="/" />
      <LinkedListItem icon={Info} text="About" href="/about" />
    </List>
  </>
);
