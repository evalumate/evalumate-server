import { UserRole } from "../../../../models/UserRole";
import { selectSession, selectUserRole } from "../../../../store/selectors/global";
import { Box, Hidden, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";

const useStyles = makeStyles(() => ({
  root: { flexGrow: 1 },
}));

type Props = ConnectedProps<typeof connectToRedux>;

const InternalTitle: React.FunctionComponent<Props> = ({ role, session }) => {
  const classes = useStyles({});

  const appTitle = "EvaluMate (Alpha)";

  return (
    <Typography variant="h6" className={classes.root}>
      {role === UserRole.Visitor && appTitle}
      {[UserRole.Owner, UserRole.Member].includes(role) && (
        <>
          <Hidden implementation="css" smDown>
            {appTitle}
          </Hidden>
          <Hidden implementation="css" mdUp>
            {/* TODO: Make text overflow work */}
            <Box component="div" style={{ whiteSpace: "nowrap" }} textOverflow="ellipsis">
              {session && session.name}
            </Box>
          </Hidden>
        </>
      )}
    </Typography>
  );
};

const mapStateToProps = (state: RootState) => ({
  role: selectUserRole(state),
  session: selectSession(state),
});

const connectToRedux = connect(mapStateToProps);

export const Title = connectToRedux(InternalTitle);
