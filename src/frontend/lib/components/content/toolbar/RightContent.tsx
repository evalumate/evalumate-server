import { VisitorButtons } from "./VisitorButtons";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { selectSession } from "../../../store/selectors/owner";
import { selectUserRole } from "../../../store/selectors/global";
import { UserRole } from "../../../store/reducers/global";
import { OwnerActionMenu } from "./OwnerActionMenu";
import { Hidden } from "@material-ui/core";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalRightContent: React.FunctionComponent<Props> = props => {
  if (props.userRole == UserRole.Owner) {
    return <OwnerActionMenu />;
  }
  return (
    <Hidden implementation="css" smDown>
      <VisitorButtons />
    </Hidden>
  );
};

const mapStateToProps = (state: RootState) => ({
  userRole: selectUserRole(state),
});

const connectToRedux = connect(mapStateToProps);

export const RightContent = connectToRedux(InternalRightContent);
