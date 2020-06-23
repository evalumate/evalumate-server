import { IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import * as React from "react";
import { useSelector } from "react-redux";

import { UserRole } from "../../../../models/UserRole";
import { useThunkDispatch } from "../../../../store";
import { resetSession, setUserRole } from "../../../../store/actions/global";
import { setMember } from "../../../../store/actions/member";
import { selectUserRole } from "../../../../store/selectors/global";
import { selectMember } from "../../../../store/selectors/member";
import { deleteMember } from "../../../../store/thunks/member";

export const MemberExitSessionButton: React.FunctionComponent = ({ children }) => {
  const router = useRouter();
  const member = useSelector(selectMember);
  const userRole = useSelector(selectUserRole);
  const dispatch = useThunkDispatch();

  const exitSession = async () => {
    if (userRole == UserRole.Member) {
      dispatch(setUserRole(UserRole.Visitor));
      if (member) {
        await dispatch(deleteMember(member));
        dispatch(setMember(null));
      }
      router.push("/");
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
