import { OwnerActionMenu } from "./OwnerActionMenu";
import { VisitorButtons } from "./VisitorButtons";
import { UserRole } from "../../../../models/UserRole";
import { selectSession, selectUserRole } from "../../../../store/selectors/global";
import { Hidden, Typography, IconButton } from "@material-ui/core";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { ExitToApp } from "@material-ui/icons";
import { MemberExitSessionButton } from "./MemberExitSessionButton";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalRightContent: React.FunctionComponent<Props> = ({ role, session }) => {
  if (role == UserRole.Visitor) {
    return (
      <Hidden implementation="css" smDown>
        <VisitorButtons />
      </Hidden>
    );
  }

  return (
    <>
      <Hidden implementation="css" smDown>
        <Typography variant="h6">{session.name}</Typography>
      </Hidden>
      {role == UserRole.Member && (
        <MemberExitSessionButton>
          <ExitToApp />
        </MemberExitSessionButton>
      )}
      {role == UserRole.Owner && <OwnerActionMenu />}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  role: selectUserRole(state),
  session: selectSession(state),
});

const connectToRedux = connect(mapStateToProps);

export const RightContent = connectToRedux(InternalRightContent);
