import { sortBy } from "lodash";
import { createReducer } from "typesafe-actions";

import { Record } from "../../models/Record";
import { addRecords, setRecords } from "../actions/owner";

export type OwnerState = Readonly<{
  records: Record[];
}>;

const initialState: OwnerState = {
  records: [],
};

function sortRecordsById(records: Record[]) {
  return sortBy(records, ["id"]);
}

const ownerReducer = createReducer(initialState)
  .handleAction(setRecords, (state, action) => ({
    ...state,
    records: sortRecordsById(action.payload),
  }))
  .handleAction(addRecords, (state, action) => ({
    ...state,
    records: sortRecordsById([...state.records, ...action.payload]),
  }));

export default ownerReducer;
