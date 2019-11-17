import { setUnderstanding } from "../../store/actions/member";
import { selectMember, selectUnderstanding } from "../../store/selectors/member";
import { ButtonBase, Theme } from "@material-ui/core";
import { EmojiObjects, EmojiObjectsOutlined } from "@material-ui/icons";
import { createStyles, makeStyles } from "@material-ui/styles";
import getConfig from "next/config";
import * as React from "react";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { RootState } from "StoreTypes";

const { publicRuntimeConfig } = getConfig();
const pingIntervalSeconds: number = publicRuntimeConfig.memberPingInterval * 1000;

type Props = ConnectedProps<typeof connectToRedux>;

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

const InternalUnderstandingBulb: React.FunctionComponent<Props> = ({
  member,
  understanding,
  setUnderstanding,
}) => {
  const classes = useStyles({});

  const handleButtonClick = () => {
    setUnderstanding(!understanding);
  };

  return (
    <ButtonBase
      className={classes.root}
      focusVisibleClassName={classes.focusVisible}
      onClick={handleButtonClick}
    >
      {understanding ? (
        <EmojiObjects className={classes.image} />
      ) : (
        <EmojiObjectsOutlined className={classes.image} />
      )}
    </ButtonBase>
  );
};

const mapStateToProps = (state: RootState) => ({
  member: selectMember(state),
  understanding: selectUnderstanding(state),
});

const mapDispatchToProps = {
  setUnderstanding,
};

const connectToRedux = connect(mapStateToProps, mapDispatchToProps);

export const UnderstandingBulb = connectToRedux(InternalUnderstandingBulb);
