import { Box, Hidden, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import * as React from "react";
import { ConnectedProps, connect } from "react-redux";
import { RootState } from "StoreTypes";

import { UserRole } from "../../../../models/UserRole";
import { selectSession, selectUserRole } from "../../../../store/selectors/global";
import { Link } from "../../../links/Link";

const useStyles = makeStyles(() => ({
  root: { flexGrow: 1 },
}));

type Props = ConnectedProps<typeof connectToRedux>;

const InternalTitle: React.FunctionComponent<Props> = ({ role, session }) => {
  const classes = useStyles({});

  const appTitle = "EvaluMate (Alpha)";

  if (role === UserRole.Visitor) {
    return (
      <Link href="/" className={classes.root}>
        <Typography variant="h6" color="textPrimary">
          {appTitle}
        </Typography>
      </Link>
    );
  }

  // Member or owner
  return (
    <Typography variant="h6" className={classes.root}>
      <Hidden implementation="css" smDown>
        {appTitle}
      </Hidden>
      <Hidden implementation="css" mdUp>
        {/* TODO: Make text overflow work */}
        <Box component="div" style={{ whiteSpace: "nowrap" }} textOverflow="ellipsis">
          {session && session.name}
        </Box>
      </Hidden>
    </Typography>
  );
};

const mapStateToProps = (state: RootState) => ({
  role: selectUserRole(state),
  session: selectSession(state),
});

const connectToRedux = connect(mapStateToProps);

export const Title = connectToRedux(InternalTitle);
