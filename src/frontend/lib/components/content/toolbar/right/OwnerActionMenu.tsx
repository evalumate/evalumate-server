import { Button, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import * as React from "react";
import { useModal } from "react-modal-hook";
import { useSelector } from "react-redux";

import { useMenuHandler } from "../../../../hooks/menuHandler";
import { useThunkDispatch } from "../../../../store";
import { resetSession } from "../../../../store/actions/session";
import { selectSession } from "../../../../store/selectors/session";
import { deleteSession } from "../../../../store/thunks/session";
import { TextDialog } from "../../../layout/dialogs/TextDialog";
import { InviteMembersDialog } from "../../InviteMembersDialog";

/**
 * A menu with session owner actions. Note: This component can only be rendered when the user is a
 * session owner and a valid session is set.
 */
export const OwnerActionMenu: React.FunctionComponent = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useThunkDispatch();
  const session = useSelector(selectSession);

  if (!session) {
    return null;
  }

  const [showInviteMembersModal, hideInviteMembersModal] = useModal(({ in: open, onExited }) => (
    <InviteMembersDialog
      open={open}
      onExited={onExited}
      onClose={hideInviteMembersModal}
      fullScreen={isSmallScreen}
      onCloseButtonClick={hideInviteMembersModal}
    />
  ));

  const stopSessionAndExit = async () => {
    if (await dispatch(deleteSession(session, { successSnackbarMessage: "Session deleted" }))) {
      dispatch(resetSession());
    }
  };

  const [showDeleteSessionModal, hideDeleteSessionModal] = useModal(({ in: open, onExited }) => (
    <TextDialog
      open={open}
      onExited={onExited}
      onClose={hideDeleteSessionModal}
      fullScreen={isSmallScreen}
      dialogId="stop-session"
      dialogTitle="Stop session and exit?"
      dialogText="This will irreversibly delete the session and all its associated statistics. Are you sure?"
      buttons={
        <>
          <Button onClick={hideDeleteSessionModal} color="primary" autoFocus>
            No, take me back!
          </Button>
          <Button
            onClick={() => {
              hideDeleteSessionModal();
              stopSessionAndExit();
            }}
            color="primary"
            variant="contained"
          >
            Yes, delete the session
          </Button>
        </>
      }
    />
  ));

  const [buttonProps, menuProps, createCloseHandler] = useMenuHandler("Session options");

  return (
    <>
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
        <MenuItem onClick={createCloseHandler(showInviteMembersModal)}>Invite members</MenuItem>
        {/* <MenuItem onClick={createCloseHandler(() => {})}>Connect another device</MenuItem> */}
        <MenuItem onClick={createCloseHandler(showDeleteSessionModal)}>
          Stop session and exit
        </MenuItem>
      </Menu>
    </>
  );
};
