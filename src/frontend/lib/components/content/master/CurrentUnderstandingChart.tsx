import { useTheme } from "@material-ui/core";
import * as React from "react";
import { ConnectedProps, connect } from "react-redux";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, YAxis } from "recharts";
import { RootState } from "StoreTypes";

import { selectLatestUnderstandingPercentage } from "../../../store/selectors/owner";
import { Title } from "../../layout/Title";

type Props = ConnectedProps<typeof connectToRedux>;

const InternalCurrentUnderstandingChart: React.FunctionComponent<Props> = ({ understanding }) => {
  const theme = useTheme();
  const palette = theme.palette;

  return (
    <>
      <Title>Current</Title>
      <ResponsiveContainer height={300}>
        <BarChart
          data={[{ understanding }]}
          margin={{
            top: theme.spacing(2),
            left: -16,
          }}
        >
          <YAxis type="number" domain={[0, 100]} unit="%" />
          <CartesianGrid strokeDasharray="3" vertical={false} />
          <Bar dataKey="understanding" fill={palette.primary.main} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  understanding: selectLatestUnderstandingPercentage(state),
});

const connectToRedux = connect(mapStateToProps);

export const CurrentUnderstandingChart = connectToRedux(InternalCurrentUnderstandingChart);
