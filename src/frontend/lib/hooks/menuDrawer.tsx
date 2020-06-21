import { SwipeableDrawer } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import * as React from "react";

/**
 * A React hook that returns a drawer JSX component and a function `toggleMenuDrawer()` that, given
 * a boolean, returns a callback to open or close the drawer.
 */
export function useMenuDrawer(
  Content: React.ComponentType<any>
): [JSX.Element, (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void] {
  const useStyles = makeStyles({
    sideMenu: {
      width: 250,
    },
  });
  const classes = useStyles({});

  const [state, setState] = React.useState({
    open: false,
  });

  const toggleMenuDrawer = (open: boolean) => (
    event?: React.KeyboardEvent | React.MouseEvent | React.SyntheticEvent<{}, Event>
  ) => {
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
        <Content />
      </div>
    </SwipeableDrawer>
  );

  return [menuDrawer, toggleMenuDrawer];
}
