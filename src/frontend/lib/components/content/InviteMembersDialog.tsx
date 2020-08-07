import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core";
import { DialogProps } from "@material-ui/core/Dialog";
import getConfig from "next/config";
import QRCode from "qrcode.react";
import * as React from "react";
import { useSelector } from "react-redux";

import { selectSession } from "../../store/selectors/session";
import { Router } from "../../util/i18n";

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
};

export const InviteMembersDialog: React.FunctionComponent<Props> = ({
  onCloseButtonClick,
  ...dialogProps
}) => {
  const classes = useStyles();
  const session = useSelector(selectSession);

  if (!session) {
    return null;
  }

  const sessionUrl = `${new URL(Router.pathname).host}/${session.id}`;

  return (
    <Dialog {...dialogProps} aria-labelledby="responsive-dialog-title">
      <DialogTitle id="responsive-dialog-title">Invite Members</DialogTitle>
      <DialogContent>
        <DialogContentText>Participants can scan this QR code...</DialogContentText>
        <QRCode value={sessionUrl} renderAs="svg" className={classes.qrcode} />
        <DialogContentText>
          ...or go to <b>{sessionUrl}</b>.
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
