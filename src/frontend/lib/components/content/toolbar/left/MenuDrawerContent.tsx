import { LinkedListItem } from "../../../layout/toolbar/LinkedListItem";
import { Divider, List } from "@material-ui/core";
import { PersonAdd, Create, Info } from "@material-ui/icons";
import * as React from "react";

export const MenuDrawerContent: React.FunctionComponent = () => (
  <>
    <List>
      <LinkedListItem icon={PersonAdd} text="Join session" href="/client" />
      <LinkedListItem icon={Create} text="Create session" href="/master" />
    </List>
    <Divider />
    <List>
      <LinkedListItem icon={Info} text="About" href="/about" />
    </List>
  </>
);
