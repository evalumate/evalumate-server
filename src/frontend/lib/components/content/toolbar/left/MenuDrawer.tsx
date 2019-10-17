import { MenuDrawerContent } from "./MenuDrawerContent";
import { useMenuDrawer } from "../../../../hooks/menuDrawer";
import { makeStyles } from "@material-ui/core/styles";
import { Menu as MenuIcon } from "@material-ui/icons";
import * as React from "react";
import { IconButton } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {},
  menuButton: {
    marginRight: theme.spacing(1),
  },
}));

export const MenuDrawer: React.FunctionComponent = () => {
  const classes = useStyles({});

  const [menuDrawer, toggleMenuDrawer] = useMenuDrawer(MenuDrawerContent);

  return (
    <>
      <IconButton
        edge="start"
        className={classes.menuButton}
        color="inherit"
        aria-label="menu"
        onClick={toggleMenuDrawer(true)}
      >
        <MenuIcon />
      </IconButton>
      {menuDrawer}
    </>
  );
};
