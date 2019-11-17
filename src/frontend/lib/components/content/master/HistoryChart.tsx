import { selectRecords } from "../../../store/selectors/owner";
import { Title } from "../../layout/Title";
import { useTheme } from "@material-ui/core";
import moment from "moment";
import getConfig from "next/config";
import * as React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RootState } from "StoreTypes";

const { publicRuntimeConfig } = getConfig();

const xScaleChangeInterval = publicRuntimeConfig.historyScaleChangeInterval;

function formatUnixTime(time: number, formatString: string = "HH:mm") {
  return moment.unix(time).format(formatString);
}

type Props = ConnectedProps<typeof connectToRedux>;

const InternalHistoryChart: React.FunctionComponent<Props> = ({ records }) => {
  const theme = useTheme();
  const palette = theme.palette;

  return (
    <>
      <Title>History</Title>
      <ResponsiveContainer height={300}>
        <AreaChart
          data={records}
          margin={{
            top: theme.spacing(2),
            left: -16,
          }}
        >
          <YAxis name="Members" type="number" domain={[0, "dataMax"]} allowDecimals={false} />
          <XAxis
            dataKey="time"
            type="number"
            domain={[
              "dataMin",
              dataMax => (Math.floor(dataMax / xScaleChangeInterval) + 1) * xScaleChangeInterval,
            ]}
            name="Time"
            tickFormatter={formatUnixTime}
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
            strokeDasharray="3"
            fill={palette.primary.light}
            fillOpacity={1}
            name="Understanding Members"
            isAnimationActive={false}
          />
          <Tooltip labelFormatter={label => formatUnixTime(Number(label), "HH:mm:ss")} />
          <Legend iconType="plainline" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  records: selectRecords(state),
});

const connectToRedux = connect(mapStateToProps);

export const HistoryChart = connectToRedux(InternalHistoryChart);
