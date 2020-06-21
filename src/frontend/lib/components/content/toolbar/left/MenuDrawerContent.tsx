import { List } from "@material-ui/core";
import { Home, Info } from "@material-ui/icons";
import * as React from "react";

import { LinkedListItem } from "../../../layout/toolbar/LinkedListItem";

export const MenuDrawerContent: React.FunctionComponent = () => (
  <>
    <List>
      <LinkedListItem icon={Home} text="Home" href="/" />
      <LinkedListItem icon={Info} text="About" href="/about" />
    </List>
  </>
);
