import getConfig from "next/config";
import { delay, fork, put, race, select, take, takeEvery } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { UserRole } from "../models/UserRole";
import { isClient } from "../util/environment";
import { redirectTo } from "../util/redirect";
import {
  resetSession,
  setIsUnderstanding,
  setMemberSession,
  setOwnerSession,
} from "./actions/session";
import { selectUserRole } from "./selectors/session";
import { selectIsUnderstanding, selectMember } from "./selectors/session";
import { setIsUnderstanding as apiSetIsUnderstanding } from "./thunks/member";

const { publicRuntimeConfig } = getConfig();
const { memberPingInterval } = publicRuntimeConfig;

/**
 * Pings the API with the current understanding value.
 */
export function* memberSaga() {
  const member = yield select(selectMember);
  while ((yield select(selectUserRole)) === UserRole.Member) {
    const understanding = yield select(selectIsUnderstanding);
    yield put(apiSetIsUnderstanding(member, understanding, { showErrorInfoDialog: false }) as any); // put typing doesn't support thunk actions :/

    // Wait for understanding to be set or a memberPingInterval to pass
    yield race({
      take: take(getType(setIsUnderstanding)),
      delay: delay(memberPingInterval * 1000),
    });
  }
}

/**
 * Redirect on the client side as a reaction to the `setOwnerSession`, `setMemberSession`, or
 * `resetSession` action.
 */
export function* redirectBySessionAction(
  action: ActionType<typeof setMemberSession | typeof setOwnerSession | typeof resetSession>
) {
  switch (action.type) {
    case getType(setOwnerSession):
      redirectTo(`/${action.payload.id}`);
      break;

    case getType(setMemberSession):
      redirectTo(`/${action.payload.session.id}`);
      break;

    case getType(resetSession):
      redirectTo("/");
      break;
  }
}

export function* rootSaga() {
  yield takeEvery(getType(setMemberSession), memberSaga);
  if ((yield select(selectUserRole)) === UserRole.Member) {
    yield fork(memberSaga);
  }

  if (isClient) {
    yield takeEvery(
      [getType(setMemberSession), getType(setOwnerSession), getType(resetSession)],
      redirectBySessionAction
    );
  }
}
