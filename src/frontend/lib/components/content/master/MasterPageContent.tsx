import { Box, Grid } from "@material-ui/core";
import getConfig from "next/config";
import * as React from "react";
import { useSelector } from "react-redux";
import useSWR from "swr";

import { useThunkDispatch } from "../../../store";
import { selectSession } from "../../../store/selectors/global";
import { fetchRecords } from "../../../store/thunks/record";
import { Paper } from "../../layout/Paper";
import { CurrentUnderstandingChart } from "./CurrentUnderstandingChart";
import { HistoryChart } from "./HistoryChart";

const { publicRuntimeConfig } = getConfig();

const recordInterval: number = publicRuntimeConfig.recordInterval * 1000;

export const MasterPageContent: React.FunctionComponent = () => {
  const session = useSelector(selectSession);
  const dispatch = useThunkDispatch();

  if (!session) {
    return null;
  }

  const recordFetcher = async () => {
    const records = await dispatch(fetchRecords(session));
    return records ? records : [];
  };
  const { data: records } = useSWR("records", recordFetcher, { refreshInterval: recordInterval });

  const latestRecord = records ? records[records.length - 1] : null;
  const currentPercentage = latestRecord?.activeMembersCount
    ? latestRecord.understandingMembersCount / latestRecord.activeMembersCount
    : 1;

  return (
    session && (
      <>
        <Box clone order={{ xs: 2, md: 1 }}>
          <Grid item xs={12} md={10}>
            <Paper>
              <HistoryChart records={records} />
            </Paper>
          </Grid>
        </Box>
        <Box clone order={{ xs: 1, md: 2 }}>
          <Grid item xs={12} md={2}>
            <Paper>
              <CurrentUnderstandingChart percentage={currentPercentage} />
            </Paper>
          </Grid>
        </Box>
      </>
    )
  );
};
