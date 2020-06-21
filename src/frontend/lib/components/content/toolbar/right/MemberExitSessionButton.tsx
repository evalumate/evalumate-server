import { IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { deleteMember } from "../../../../api/member";
import { UserRole } from "../../../../models/UserRole";
import { setSession, setUserRole } from "../../../../store/actions/global";
import { setMember, setUnderstanding } from "../../../../store/actions/member";
import { selectUserRole } from "../../../../store/selectors/global";
import { selectMember } from "../../../../store/selectors/member";

export const MemberExitSessionButton: React.FunctionComponent = ({ children }) => {
  const router = useRouter();
  const member = useSelector(selectMember);
  const userRole = useSelector(selectUserRole);
  const dispatch = useDispatch();

  const exitSession = async () => {
    if (userRole == UserRole.Member) {
      dispatch(setUserRole(UserRole.Visitor));
      if (member) {
        await deleteMember(member);
        dispatch(setMember(null));
      }
      router.push("/");

      dispatch(setSession(null));
      setUnderstanding(true);
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
