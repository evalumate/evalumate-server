import { selectLatestRecord } from "../../../store/selectors/owner";
import theme from "../../../theme";
import { Title } from "../../layout/Title";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, YAxis } from "recharts";
import { RootState } from "StoreTypes";

const palette = theme.palette;

type Props = ConnectedProps<typeof connectToRedux>;

const InternalCurrentUnderstandingChart: React.FunctionComponent<Props> = ({ record }) => {
  let understanding: number;
  if (!record || record.activeMembersCount == 0) {
    understanding = 100;
  } else {
    understanding = Math.floor(
      (record.understandingMembersCount / record.activeMembersCount) * 100
    );
  }
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
  record: selectLatestRecord(state),
});

const connectToRedux = connect(mapStateToProps);

export const CurrentUnderstandingChart = connectToRedux(InternalCurrentUnderstandingChart);
