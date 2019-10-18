import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { selectSession, selectUserRole } from "../../../store/selectors/global";
import { IconButton } from "@material-ui/core";
import { setUserRole, setSession } from "../../../store/actions/global";
import { UserRole } from "../../../models/UserRole";
import { useRouter } from "next/router";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalMemberExitSessionButton: React.FunctionComponent<Props> = ({
  children,
  userRole,
  setUserRole,
  setSession,
}) => {
  const router = useRouter();

  const exitSession = () => {
    if (userRole == UserRole.Member) {
      setSession(null);
      setUserRole(UserRole.Visitor);
    }
    router.push("/");
  };

  return (
    <IconButton aria-label="leave session" title="Leave session" onClick={exitSession}>
      {children}
    </IconButton>
  );
};

const mapStateToProps = (state: RootState) => ({
  userRole: selectUserRole(state),
});

const mapDispatchToProps = {
  setUserRole,
  setSession,
};

const connectToRedux = connect(
  mapStateToProps,
  mapDispatchToProps
);

export const MemberExitSessionButton = connectToRedux(InternalMemberExitSessionButton);
