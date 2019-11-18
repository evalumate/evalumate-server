import { selectSession } from "../../store/selectors/global";
import { DialogProps } from "@material-ui/core/Dialog";
import getConfig from "next/config";
import QRCode from "qrcode.react";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  makeStyles,
  createStyles,
  Theme,
  NoSsr,
} from "@material-ui/core";

const { publicRuntimeConfig } = getConfig();
const { publicUrl } = publicRuntimeConfig;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    qrcode: {
      width: "100%",
      minWidth: "50%",
      height: "70%",
      maxHeight: "70%",
      padding: theme.spacing(2),
    },
  })
);

type Props = DialogProps & {
  onCloseButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
} & ConnectedProps<typeof connectToRedux>;

const InternalInviteMembersDialog: React.FunctionComponent<Props> = ({
  session,
  onCloseButtonClick,
  ...dialogProps
}) => {
  const classes = useStyles({});

  if (!session) {
    return null;
  }

  return (
    <Dialog {...dialogProps} aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">Invite Members</DialogTitle>
      <DialogContent>
        <DialogContentText>Participants can scan this QR code...</DialogContentText>
        <QRCode
          value={`${publicUrl}/client/${session.id}`}
          renderAs="svg"
          className={classes.qrcode}
        />
        <DialogContentText>
          ...or go to <b>{publicUrl}</b> and join session <b>{session.id}</b>.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseButtonClick} color="primary" autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state: RootState) => ({
  session: selectSession(state),
});

const connectToRedux = connect(mapStateToProps);

export const InviteMembersDialog = connectToRedux(InternalInviteMembersDialog);
