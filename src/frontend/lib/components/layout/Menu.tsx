import { makeStyles } from "@material-ui/core/styles";
import { Mail as MailIcon, Menu as MenuIcon, SvgIconComponent } from "@material-ui/icons";
import * as React from "react";
import {
  IconButton,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Hidden,
  AppBar,
  SwipeableDrawer,
  Typography,
} from "@material-ui/core";
import { ButtonLink } from "../links/ButtonLink";
import { ListItemLink } from "../links/ListItemLink";

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

interface LinkedMenuButtonProps {
  text: string;
  href: string;
}

const LinkedMenuButton: React.FunctionComponent<LinkedMenuButtonProps> = props => (
  <ButtonLink size="large" color="inherit" href={props.href}>
    {props.text}
  </ButtonLink>
);

const MenuButtons: React.FunctionComponent = () => (
  <>
    <LinkedMenuButton text="Join Session" href="/client" />
    <LinkedMenuButton text="Create Session" href="/master" />
    <LinkedMenuButton text="About" href="/about" />
  </>
);

interface LinkedListItemProps {
  text: string;
  href: string;
  icon: SvgIconComponent;
}

const LinkedListItem: React.FunctionComponent<LinkedListItemProps> = props => (
  <ListItemLink button color="inherit" key={props.text} href={props.href}>
    <ListItemIcon>{<props.icon />}</ListItemIcon>
    <ListItemText primary={props.text} />
  </ListItemLink>
);

const MenuDrawerContent: React.FunctionComponent = () => (
  <>
    <List>
      <LinkedListItem icon={MailIcon} text="Join session" href="/client" />
      <LinkedListItem icon={MailIcon} text="Create session" href="/master" />
    </List>
    <Divider />
    <List>
      <LinkedListItem icon={MailIcon} text="About" href="/about" />
    </List>
  </>
);

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
        <MenuDrawerContent />
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
            <MenuButtons />
          </Hidden>
        </Toolbar>
      </AppBar>
      {menuDrawer}
    </div>
  );
};
