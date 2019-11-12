import { RootState } from "StoreTypes";

export const selectRecords = (state: RootState) => state.owner.records;
export const selectLatestRecord = (state: RootState) => {
  const records = state.owner.records;
  return records.length == 0 ? null : records[records.length - 1];
};
