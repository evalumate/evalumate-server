import { createSelector } from "reselect";
import { RootState } from "StoreTypes";

export const selectRecords = (state: RootState) => state.owner.records;

export const selectLatestRecord = createSelector([selectRecords], (records) =>
  records.length == 0 ? null : records[records.length - 1]
);

export const selectLatestUnderstandingPercentage = createSelector(
  [selectLatestRecord],
  (record) => {
    if (!record || record.activeMembersCount == 0) {
      return 100;
    } else {
      return Math.floor((record.understandingMembersCount / record.activeMembersCount) * 100);
    }
  }
);
