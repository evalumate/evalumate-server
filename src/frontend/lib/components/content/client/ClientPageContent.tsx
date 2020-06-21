import * as React from "react";
import { useSelector } from "react-redux";

import { Session } from "../../../models/Session";
import { UserRole } from "../../../models/UserRole";
import { selectUserRole } from "../../../store/selectors/global";
import { JoinSessionForm } from "../..//forms/JoinSessionForm";
import { UnderstandingBulb } from "../../content/client/UnderstandingBulb";

type Props = {
  session: Session;
};

export const ClientPageContent: React.FunctionComponent<Props> = ({ session }) => {
  const userRole = useSelector(selectUserRole);

  if (userRole === UserRole.Visitor) {
    return <JoinSessionForm session={session} />;
  } else {
    return <UnderstandingBulb />;
  }
};
