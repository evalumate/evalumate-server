import { showSnackbar } from "./actions/global";
import { selectUserRole, selectSession } from "./selectors/global";
import { UserRole } from "../models/UserRole";
import { call, delay, put, select } from "redux-saga/effects";
import { selectLatestRecord } from "./selectors/owner";
import { Record } from "../models/Record";
import { getRecords } from "../api/record";
import { addRecords } from "./actions/owner";

const isClient = process.browser;

// TODO Rework saga structure, use sagas for the client too

function* fetchRecordsSaga() {
  const session = yield select(selectSession);
  const latestRecord: Record | null = yield select(selectLatestRecord);
  let newRecords: Record[] | null;
  if (!latestRecord) {
    // Query all records
    newRecords = yield call(getRecords, session);
  } else {
    // Query all records after latestRecord
    newRecords = yield call(getRecords, session, latestRecord.id);
  }
  if (newRecords && newRecords.length > 0) {
    yield put(addRecords(newRecords));
  }
}

function* pingSaga() {
  switch (yield select(selectUserRole)) {
    case UserRole.Owner:
      yield call(fetchRecordsSaga);
      break;
  }
}

export function* rootSaga() {
  yield call(pingSaga);
  if (isClient) {
    while (true) {
      yield delay(15000);
      yield call(pingSaga);
    }
  }
}
