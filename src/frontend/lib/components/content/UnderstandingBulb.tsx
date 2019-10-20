import { setUnderstanding } from "../../store/actions/member";
import { selectMember, selectUnderstanding } from "../../store/selectors/member";
import * as React from "react";
import { connect, ConnectedProps, useSelector } from "react-redux";
import { RootState } from "StoreTypes";
import { makeStyles, createStyles } from "@material-ui/styles";
import { Theme, Button, ButtonBase } from "@material-ui/core";
import { EmojiObjects, EmojiObjectsOutlined } from "@material-ui/icons";
import { setUnderstanding as apiSetUnderstanding } from "../../api/member";
import useInterval from "@use-it/interval";

import getConfig from "next/config";

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

  const pingApi = () => {
    apiSetUnderstanding(member, understanding);
  };

  // Contact the API on `understanding` changes and regularly ping it with the current state
  React.useEffect(() => {
    pingApi();
    const intervalId = setInterval(() => {
      pingApi();
    }, pingIntervalSeconds);
    return () => clearInterval(intervalId);
  }, [understanding]);

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

const connectToRedux = connect(
  mapStateToProps,
  mapDispatchToProps
);

export const UnderstandingBulb = connectToRedux(InternalUnderstandingBulb);
