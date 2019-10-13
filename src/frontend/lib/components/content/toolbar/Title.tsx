import { makeStyles } from "@material-ui/core/styles";
import * as React from "react";
import { Typography, Hidden, Box } from "@material-ui/core";
import { ConnectedProps, connect } from "react-redux";
import { selectUserRole } from "../../../store/selectors/global";
import { RootState } from "StoreTypes";
import { selectSession } from "../../../store/selectors/owner";
import { UserRole } from "../../../store/reducers/global";

const useStyles = makeStyles(() => ({
  root: { flexGrow: 1 },
}));

type Props = ConnectedProps<typeof connectToRedux>;

export const InternalTitle: React.FunctionComponent<Props> = props => {
  const classes = useStyles({});

  const role = props.userRole;
  const appTitle = "EvaluMate";

  return (
    <Typography variant="h6" className={classes.root}>
      {role == UserRole.Visitor && appTitle}
      {role == UserRole.Owner && (
        <>
          <Hidden implementation="css" smDown>
            {appTitle}
          </Hidden>
          <Hidden implementation="css" mdUp>
            {/* TODO: Make text overflow work */}
            <Box component="div" style={{ whiteSpace: "nowrap" }} textOverflow="ellipsis">
              {props.session && props.session.name}
            </Box>
          </Hidden>
        </>
      )}
    </Typography>
  );
};

const mapStateToProps = (state: RootState) => ({
  userRole: selectUserRole(state),
  session: selectSession(state),
});

const connectToRedux = connect(mapStateToProps);

export const Title = connectToRedux(InternalTitle);
