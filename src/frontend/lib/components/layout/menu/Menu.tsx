import { makeStyles } from "@material-ui/core/styles";
import { Menu as MenuIcon } from "@material-ui/icons";
import * as React from "react";
import {
  IconButton,
  Toolbar,
  Hidden,
  AppBar,
  SwipeableDrawer,
  Typography,
} from "@material-ui/core";
import { DrawerContent } from "../../content/menu/DrawerContent";
import { Buttons } from "../../content/menu/Buttons";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
}));

/**
 * A React hook that returns a drawer JSX component and a function `toggleMenuDrawer()` that, given
 * a boolean, returns a callback to open or close the drawer.
 */
function useMenuDrawer(): [
  JSX.Element,
  (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void
] {
  const useStyles = makeStyles({
    sideMenu: {
      width: 250,
    },
  });
  const classes = useStyles({});

  const [state, setState] = React.useState({
    open: false,
  });

  const toggleMenuDrawer = (open: boolean) => (event?: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event && // No event is passed if the drawer is swiped
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setState({ open });
  };

  const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

  const menuDrawer = (
    <SwipeableDrawer
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      open={state.open}
      onOpen={toggleMenuDrawer(true)}
      onClose={toggleMenuDrawer(false)}
    >
      <div
        className={classes.sideMenu}
        role="presentation"
        onClick={toggleMenuDrawer(false)}
        onKeyDown={toggleMenuDrawer(false)}
      >
        <DrawerContent />
      </div>
    </SwipeableDrawer>
  );

  return [menuDrawer, toggleMenuDrawer];
}

export const Menu: React.FunctionComponent = () => {
  const classes = useStyles({});

  const [menuDrawer, toggleMenuDrawer] = useMenuDrawer();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Hidden implementation="css" mdUp>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleMenuDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Hidden>
          <Typography variant="h6" className={classes.title}>
            EvaluMate
          </Typography>
          <Hidden implementation="css" smDown>
            <Buttons />
          </Hidden>
        </Toolbar>
      </AppBar>
      {menuDrawer}
    </div>
  );
};
