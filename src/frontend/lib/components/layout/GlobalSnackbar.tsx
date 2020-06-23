import { Snackbar } from "@material-ui/core";
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import { resetSnackbar } from "../../store/actions/dialogs";
import { selectSnackbarIsVisible, selectSnackbarMessage } from "../../store/selectors/dialogs";

export const GlobalSnackbar: React.FunctionComponent = () => {
  const message = useSelector(selectSnackbarMessage);
  const isVisible = useSelector(selectSnackbarIsVisible);
  const dispatch = useDispatch();

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      open={isVisible}
      onClose={() => dispatch(resetSnackbar())}
      autoHideDuration={5000}
      ContentProps={{
        "aria-describedby": "global-snackbar-message",
      }}
      message={<span id="global-snackbar-message">{message}</span>}
    />
  );
};
