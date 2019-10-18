import { MenuDrawer } from "./MenuDrawer";
import { UserRole } from "../../../../models/UserRole";
import { selectUserRole } from "../../../../store/selectors/global";
import { Hidden } from "@material-ui/core";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalLeftContent: React.FunctionComponent<Props> = ({ role }) => (
  <Hidden implementation="css" mdUp>
    {role == UserRole.Visitor && <MenuDrawer />}
  </Hidden>
);

const mapStateToProps = (state: RootState) => ({
  role: selectUserRole(state),
});

const connectToRedux = connect(mapStateToProps);

export const LeftContent = connectToRedux(InternalLeftContent);
