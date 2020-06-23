import getConfig from "next/config";
import { Task } from "redux-saga";
import { call, cancel, delay, fork, put, putResolve, race, select, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { Record } from "../models/Record";
import { UserRole } from "../models/UserRole";
import { isClient, isServer } from "../util/environment";
import { setUserRole } from "./actions/global";
import { setUnderstanding } from "./actions/member";
import { addRecords } from "./actions/owner";
import { selectSession, selectUserRole } from "./selectors/global";
import { selectMember, selectUnderstanding } from "./selectors/member";
import { selectLatestRecord } from "./selectors/owner";
import { setUnderstanding as apiSetUnderstanding } from "./thunks/member";
import { getRecords } from "./thunks/record";

const { publicRuntimeConfig } = getConfig();
const { recordInterval, memberPingInterval } = publicRuntimeConfig;

/**
 * Fetches records from the API.
 *
 * Note: The user has to be a session owner in order for this to take effect.
 */
export function* fetchRecordsSaga() {
  const session = yield select(selectSession);
  const latestRecord: Record | null = yield select(selectLatestRecord);
  let newRecords: Record[] | null;
  if (!latestRecord) {
    // Query all records
    newRecords = yield putResolve(getRecords(session) as any); // putResolve typing doesn't support thunk actions :(
  } else {
    // Query all records after latestRecord
    newRecords = yield putResolve(getRecords(session, latestRecord.id) as any); // putResolve typing doesn't support thunk actions :(
  }
  if (newRecords && newRecords.length > 0) {
    yield put(addRecords(newRecords));
  }
}

/**
 * On the client side, periodically calls `fetchRecordsSaga`. On the server side, `fetchRecordsSaga`
 * is called only once.
 */
export function* ownerSaga() {
  yield call(fetchRecordsSaga);
  if (isClient) {
    while (true) {
      yield delay(recordInterval * 1000);
      yield call(fetchRecordsSaga);
    }
  }
}

/**
 * Pings the API with the current understanding value.
 */
export function* memberSaga() {
  const member = yield select(selectMember);
  while (true) {
    // Wait for understanding to be set or a memberPingInterval to pass
    const result = yield race({
      take: take(getType(setUnderstanding)),
      delay: delay(memberPingInterval * 1000),
    });
    const understanding = yield select(selectUnderstanding);
    yield put(apiSetUnderstanding(member, understanding) as any); // put typing doesn't support thunk actions :(
  }
}

/**
 * Depending on the user role, forks `ownerSaga`, `memberSaga`, or does nothing. On the client side,
 * cancels the forked saga and starts again every time the user role is set.
 */
export function* pingSaga() {
  const createForkSagaByUserRoleEffect = (role: UserRole) => {
    switch (role) {
      case UserRole.Owner:
        return fork(ownerSaga);
      case UserRole.Member:
        if (isClient) {
          return fork(memberSaga);
        }
        break;
    }
    return null;
  };

  let role: UserRole = yield select(selectUserRole);

  if (isServer) {
    // Fork if applicable
    const forkEffect = createForkSagaByUserRoleEffect(role);
    if (forkEffect) {
      yield forkEffect;
    }
  } else {
    let lastTask: Task | null = null;
    while (true) {
      // Fork if applicable
      const forkEffect = createForkSagaByUserRoleEffect(role);
      if (forkEffect) {
        lastTask = yield forkEffect;
      }

      role = yield take(getType(setUserRole));
      if (lastTask) {
        yield cancel(lastTask);
        lastTask = null;
      }
    }
  }
}

export function* rootSaga() {
  yield fork(pingSaga);
}
