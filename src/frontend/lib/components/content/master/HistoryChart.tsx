import { useTheme } from "@material-ui/core";
import moment from "moment";
import getConfig from "next/config";
import * as React from "react";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Record } from "../../../models/Record";
import { Title } from "../../layout/Title";

const { publicRuntimeConfig } = getConfig();

const xScaleChangeInterval: number = publicRuntimeConfig.historyScaleChangeInterval;

function formatUnixTime(time: number, formatString: string = "HH:mm") {
  return moment.unix(time).format(formatString);
}

type Props = { records?: Record[] };

export const HistoryChart: React.FunctionComponent<Props> = ({ records }) => {
  const theme = useTheme();
  const palette = theme.palette;

  if (typeof records === "undefined") {
    records = [];
  }

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
              (dataMax) => (Math.floor(dataMax / xScaleChangeInterval) + 1) * xScaleChangeInterval,
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
          <Tooltip labelFormatter={(label) => formatUnixTime(Number(label), "HH:mm:ss")} />
          <Legend iconType="plainline" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};
