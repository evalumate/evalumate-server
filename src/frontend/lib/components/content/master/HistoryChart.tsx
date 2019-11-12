import { selectRecords } from "../../../store/selectors/owner";
import moment from "moment";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "StoreTypes";
import {
  AreaChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  Area,
  Legend,
} from "recharts";
import theme from "../../../theme";

function formatUnixTime(time: number, formatString: string = "HH:mm") {
  return moment.unix(time).format(formatString);
}

const palette = theme.palette;

type Props = ConnectedProps<typeof connectToRedux>;

const InternalHistoryChart: React.FunctionComponent<Props> = ({ records }) => {
  return (
    <AreaChart width={1200} height={300} data={records}>
      <YAxis name="Members" />
      <XAxis
        dataKey="time"
        domain={["auto", "auto"]}
        name="Time"
        tickFormatter={formatUnixTime}
        type="number"
      />
      <Area
        type="linear"
        dataKey="activeMembersCount"
        stroke={palette.primary.dark}
        fill={palette.primary.light}
        fillOpacity={0.5}
        name="Active Members"
        isAnimationActive={false}
      />
      <Area
        type="linear"
        dataKey="understandingMembersCount"
        stroke={palette.primary.dark}
        fill={palette.primary.light}
        fillOpacity={1}
        name="Understanding Members"
        isAnimationActive={false}
      />
      <Tooltip labelFormatter={label => formatUnixTime(Number(label), "HH:mm:ss")} />
      <Legend iconType="line" />
    </AreaChart>
  );
};

const mapStateToProps = (state: RootState) => ({
  records: selectRecords(state),
});

const connectToRedux = connect(mapStateToProps);

export const HistoryChart = connectToRedux(InternalHistoryChart);
