import { UnderstandingBulb } from "../../content/client/UnderstandingBulb";
import * as React from "react";
import { useSelector } from "react-redux";
import { JoinSessionForm } from "../..//forms/JoinSessionForm";
import { selectUserRole } from "../../../store/selectors/global";
import { Session } from "../../../models/Session";
import { UserRole } from "../../../models/UserRole";

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
