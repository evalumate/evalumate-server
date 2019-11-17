import { UserRole } from "../../../../models/UserRole";
import { setSession, setUserRole, showSnackbar } from "../../../../store/actions/global";
import { setMember, setUnderstanding } from "../../../../store/actions/member";
import { selectUserRole, selectSession } from "../../../../store/selectors/global";
import { IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { deleteMember } from "../../../../api/member";
import { selectMember } from "../../../../store/selectors/member";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalMemberExitSessionButton: React.FunctionComponent<Props> = ({
  children,
  userRole,
  member,
  setUserRole,
  setSession,
  setMember,
  setUnderstanding,
}) => {
  const router = useRouter();

  const exitSession = async () => {
    if (userRole == UserRole.Member) {
      setUserRole(UserRole.Visitor);
      if (member) {
        await deleteMember(member);
        setMember(null);
      }
      setSession(null);
      setUnderstanding(true);

      router.push("/");
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

const mapStateToProps = (state: RootState) => ({
  userRole: selectUserRole(state),
  member: selectMember(state),
});

const mapDispatchToProps = {
  setUserRole,
  setSession,
  setMember,
  setUnderstanding,
};

const connectToRedux = connect(mapStateToProps, mapDispatchToProps);

export const MemberExitSessionButton = connectToRedux(InternalMemberExitSessionButton);
