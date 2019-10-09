import { LinkedListItem } from "../../layout/menu/LinkedListItem";
import { Divider, List } from "@material-ui/core";
import { Mail as MailIcon } from "@material-ui/icons";
import * as React from "react";

export const VisitorDrawerContent: React.FunctionComponent = () => (
  <>
    <List>
      <LinkedListItem icon={MailIcon} text="Join session" href="/client" />
      <LinkedListItem icon={MailIcon} text="Create session" href="/master" />
    </List>
    <Divider />
    <List>
      <LinkedListItem icon={MailIcon} text="About" href="/about" />
    </List>
  </>
);
