import { selectSession } from "../../../store/selectors/owner";
import { IconButton, Menu, MenuItem, Typography, Hidden } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import { useMenuHandler } from "../../../hooks/menuHandler";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalOwnerActionMenu: React.FunctionComponent<Props> = props => {
  if (!props.session) return null;

  const [buttonProps, menuProps, createCloseHandler] = useMenuHandler("Session options");

  return (
    <>
      <Hidden implementation="css" smDown>
        <Typography variant="h6">{props.session.name}</Typography>
      </Hidden>
      <IconButton {...buttonProps} color="inherit">
        <MoreVert />
      </IconButton>
      <Menu
        {...menuProps}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={createCloseHandler(() => {})}>Action 1</MenuItem>
        <MenuItem onClick={createCloseHandler(() => {})}>Action 2</MenuItem>
      </Menu>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  session: selectSession(state),
});

const connectToRedux = connect(mapStateToProps);

/**
 * A menu with session owner actions. Note: This component can only be rendered when the user is a
 * session owner and a valid session is set.
 */
export const OwnerActionMenu = connectToRedux(InternalOwnerActionMenu);
