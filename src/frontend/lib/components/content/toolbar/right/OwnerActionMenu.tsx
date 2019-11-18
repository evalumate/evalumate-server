import { deleteSession } from "../../../../api/session";
import { useMenuHandler } from "../../../../hooks/menuHandler";
import { UserRole } from "../../../../models/UserRole";
import { setSession, setUserRole, showSnackbar } from "../../../../store/actions/global";
import { selectSession } from "../../../../store/selectors/global";
import { TextDialog } from "../../../layout/dialogs/TextDialog";
import { InviteMembersDialog } from "../../InviteMembersDialog";
import { Button, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@material-ui/core";
import { MoreVert } from "@material-ui/icons";
import { useRouter } from "next/router";
import * as React from "react";
import { useModal } from "react-modal-hook";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalOwnerActionMenu: React.FunctionComponent<Props> = ({
  session,
  setSession,
  setUserRole,
  showSnackbar,
}) => {
  if (!session) {
    return null;
  }
  const router = useRouter();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
    if (await deleteSession(session)) {
      showSnackbar("Session deleted");
    } else {
      showSnackbar("Sorry, the session could not be deleted.");
    }
    setUserRole(UserRole.Visitor);
    setSession(null);
    router.push("/");
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

const mapStateToProps = (state: RootState) => ({
  session: selectSession(state),
});

const mapDispatchToProps = {
  setSession,
  setUserRole,
  showSnackbar,
};

const connectToRedux = connect(mapStateToProps, mapDispatchToProps);

/**
 * A menu with session owner actions. Note: This component can only be rendered when the user is a
 * session owner and a valid session is set.
 */
export const OwnerActionMenu = connectToRedux(InternalOwnerActionMenu);
