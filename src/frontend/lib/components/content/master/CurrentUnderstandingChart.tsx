import { useTheme } from "@material-ui/core";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, YAxis } from "recharts";

import { Title } from "../../layout/Title";

type Props = {
  percentage: number;
};

export const CurrentUnderstandingChart: React.FunctionComponent<Props> = ({ percentage }) => {
  const theme = useTheme();
  const palette = theme.palette;

  return (
    <>
      <Title>Current</Title>
      <ResponsiveContainer height={300}>
        <BarChart
          data={[{ understanding: percentage * 100 }]}
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
