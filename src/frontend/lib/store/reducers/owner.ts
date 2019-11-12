import { createReducer } from "typesafe-actions";
import { Record } from "../../models/Record";
import { setRecords, addRecords } from "../actions/owner";
import { sortBy } from "lodash";

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
