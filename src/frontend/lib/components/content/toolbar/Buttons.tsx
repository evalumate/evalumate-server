import { VisitorButtons } from "./VisitorButtons";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { selectSession } from "../../../store/selectors/owner";
import { selectUserRole } from "../../../store/selectors/global";
import { UserRole } from "../../../store/reducers/global";
import { OwnerOptions } from "./OwnerOptions";
import { Hidden } from "@material-ui/core";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalButtons: React.FunctionComponent<Props> = props => {
  if (props.userRole == UserRole.Owner && props.session != null) {
    return <OwnerOptions session={props.session} />;
  }
  return (
    <Hidden implementation="css" smDown>
      <VisitorButtons />;
    </Hidden>
  );
};

const mapStateToProps = (state: RootState) => ({
  userRole: selectUserRole(state),
  session: selectSession(state),
});

const connectToRedux = connect(mapStateToProps);

export const Buttons = connectToRedux(InternalButtons);
