import { IconButton } from "@material-ui/core";
import * as React from "react";
import { useSelector } from "react-redux";

import { useThunkDispatch } from "../../../../store";
import { resetSession } from "../../../../store/actions/session";
import { selectMember } from "../../../../store/selectors/session";
import { deleteMember } from "../../../../store/thunks/member";

export const MemberExitSessionButton: React.FunctionComponent = ({ children }) => {
  const member = useSelector(selectMember);

  const dispatch = useThunkDispatch();

  const exitSession = async () => {
    if (member && (await dispatch(deleteMember(member)))) {
      dispatch(resetSession());
    }
  };

  return (
    <IconButton
      aria-label="leave session"
      title="Leave session"
      color="inherit"
      onClick={exitSession}
    >
      {children}
    </IconButton>
  );
};
