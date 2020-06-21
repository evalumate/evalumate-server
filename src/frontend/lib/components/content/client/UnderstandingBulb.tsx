import { setUnderstanding } from "../../../store/actions/member";
import { selectUnderstanding } from "../../../store/selectors/member";
import { ButtonBase, Theme } from "@material-ui/core";
import { EmojiObjects, EmojiObjectsOutlined } from "@material-ui/icons";
import { createStyles, makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useSelector, useDispatch } from "react-redux";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: theme.spacing(1),
      width: "100%",
    },
    focusVisible: {},
    image: {
      width: "100%",
      height: "100%",
      color: theme.palette.primary.main,
    },
  })
);

export const UnderstandingBulb: React.FunctionComponent = () => {
  const classes = useStyles();
  const isUnderstanding = useSelector(selectUnderstanding);
  const dispatch = useDispatch();

  return (
    <ButtonBase
      className={classes.root}
      focusVisibleClassName={classes.focusVisible}
      onClick={() => dispatch(setUnderstanding(!isUnderstanding))}
    >
      {isUnderstanding ? (
        <EmojiObjects className={classes.image} />
      ) : (
        <EmojiObjectsOutlined className={classes.image} />
      )}
    </ButtonBase>
  );
};
