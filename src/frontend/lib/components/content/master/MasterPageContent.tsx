import { Box, Grid } from "@material-ui/core";
import * as React from "react";
import { useSelector } from "react-redux";

import { selectSession } from "../../../store/selectors/global";
import { Paper } from "../../layout/Paper";
import { CurrentUnderstandingChart } from "./CurrentUnderstandingChart";
import { HistoryChart } from "./HistoryChart";

export const MasterPageContent: React.FunctionComponent = () => {
  const session = useSelector(selectSession);

  return (
    session && (
      <>
        <Box clone order={{ xs: 2, md: 1 }}>
          <Grid item xs={12} md={10}>
            <Paper>
              <HistoryChart />
            </Paper>
          </Grid>
        </Box>
        <Box clone order={{ xs: 1, md: 2 }}>
          <Grid item xs={12} md={2}>
            <Paper>
              <CurrentUnderstandingChart />
            </Paper>
          </Grid>
        </Box>
      </>
    )
  );
};
